import { db } from "../db/schema.js";
import crypto from "crypto";

// Active live rooms in-memory state (for fast timers and WebSockets)
export const liveAuctionRooms = new Map();

export class RoomManager {
  static getFullRoomState(roomId) {
    const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomId);
    if (!room) return null;

    const participants = db.prepare(`
      SELECT p.*, t.name as team_name, t.short_name as team_short_name, t.color as team_color, t.logo_text as team_logo
      FROM room_participants p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.room_id = ?
    `).all(roomId);

    const teams = db.prepare("SELECT * FROM teams").all();
    const purses = db.prepare("SELECT * FROM room_purses WHERE room_id = ?").all(roomId);
    const purseMap = {};
    for (const p of purses) {
      purseMap[p.team_id] = p;
    }

    // Query published lineups
    const rawLineups = db.prepare("SELECT * FROM team_lineups WHERE room_id = ?").all(roomId);
    const lineupMap = {};
    for (const l of rawLineups) {
      try {
        lineupMap[l.team_id] = {
          ...l,
          playing_11_ids: JSON.parse(l.playing_11_ids || "[]"),
          impact_player_ids: JSON.parse(l.impact_player_ids || "[]"),
          substitute_ids: JSON.parse(l.substitute_ids || "[]")
        };
      } catch (e) {
        lineupMap[l.team_id] = l;
      }
    }

    // Attach squad and purse to each team
    const teamsWithSquads = teams.map(team => {
      const squad = db.prepare(`
        SELECT rp.*, pl.name, pl.role, pl.country, pl.is_overseas, pl.acquisition_type as orig_acq
        FROM room_players rp
        JOIN players pl ON rp.player_id = pl.id
        WHERE rp.room_id = ? AND rp.current_team_id = ? AND rp.status = 'SQUAD'
      `).all(roomId, team.id);

      const claimedBy = participants.find(p => p.team_id === team.id);

      return {
        ...team,
        claimed: !!claimedBy,
        ownerName: claimedBy ? claimedBy.user_name : null,
        ownerSessionId: claimedBy ? claimedBy.session_id : null,
        retentionConfirmed: !!claimedBy && claimedBy.retention_confirmed === 1,
        hasVotedEndBidding: !!claimedBy && claimedBy.vote_end_bidding === 1,
        squad,
        overseasCount: squad.filter(s => s.is_overseas === 1).length,
        squadSize: squad.length,
        isEligible: squad.length >= 18,
        lineup: lineupMap[team.id] || null,
        purse: purseMap[team.id] || { starting_purse: 125.0, purse_remaining: 125.0, contract_deductions: 0 }
      };
    });

    const activeTrades = db.prepare(`
      SELECT * FROM trades WHERE room_id = ? ORDER BY created_at DESC LIMIT 20
    `).all(roomId);

    const liveAuction = liveAuctionRooms.get(roomId) || null;

    // Calculate End Bidding majority vote status
    const claimedParticipants = participants.filter(p => p.team_id !== null);
    const totalEligibleVoters = Math.max(1, claimedParticipants.length);
    const majorityNeeded = Math.floor(totalEligibleVoters / 2) + 1;
    const votedTeamIds = participants
      .filter(p => p.vote_end_bidding === 1 && p.team_id !== null)
      .map(p => p.team_id);

    const endBiddingVotes = {
      count: votedTeamIds.length,
      total: totalEligibleVoters,
      needed: majorityNeeded,
      votedTeamIds,
      isMajority: votedTeamIds.length >= majorityNeeded
    };

    return {
      room,
      participants,
      teams: teamsWithSquads,
      trades: activeTrades,
      endBiddingVotes,
      lineups: lineupMap,
      liveAuction: liveAuction ? liveAuction.getState() : null
    };
  }

  static createRoom(hostName, sessionId) {
    const roomId = crypto.randomUUID();
    const roomCode = "IPL" + Math.floor(1000 + Math.random() * 9000); // e.g. IPL4821

    const tx = db.transaction(() => {
      // 1. Insert Room
      db.prepare(`
        INSERT INTO rooms (id, room_code, created_by, phase, max_participants, created_at)
        VALUES (?, ?, ?, 'LOBBY', 10, ?)
      `).run(roomId, roomCode, hostName, Date.now());

      // 2. Add Host as participant #1
      db.prepare(`
        INSERT INTO room_participants (id, room_id, session_id, user_name, is_host, joined_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(crypto.randomUUID(), roomId, sessionId, hostName, Date.now());

      // 3. Initialize Starting Squads in room_players from master players
      const startingPlayers = db.prepare(`
        SELECT * FROM players WHERE starting_team_id IS NOT NULL
      `).all();

      const insertRoomPlayer = db.prepare(`
        INSERT INTO room_players (id, room_id, player_id, current_team_id, status, price, former_team_id)
        VALUES (?, ?, ?, ?, 'SQUAD', ?, ?)
      `);

      for (const p of startingPlayers) {
        insertRoomPlayer.run(crypto.randomUUID(), roomId, p.id, p.starting_team_id, p.default_price, p.starting_team_id);
      }

      // 4. Initialize Purses for all 10 teams
      const teams = db.prepare("SELECT id FROM teams").all();
      const insertPurse = db.prepare(`
        INSERT INTO room_purses (id, room_id, team_id, starting_purse, purse_remaining)
        VALUES (?, ?, ?, 125.0, 125.0)
      `);

      for (const t of teams) {
        insertPurse.run(crypto.randomUUID(), roomId, t.id);
      }
    });

    tx();
    return { roomId, roomCode };
  }

  static joinRoom(roomCode, userName, sessionId) {
    const clean = (roomCode || "").trim();
    // Allow matching by either room_code (e.g. IPL4821) or full roomId
    const room = db.prepare(`
      SELECT * FROM rooms 
      WHERE UPPER(room_code) = UPPER(?) OR id = ?
    `).get(clean, clean);

    if (!room) {
      return { success: false, error: "Room not found. Please verify the invite link or code." };
    }

    // Check if user is already a participant
    const existing = db.prepare(`
      SELECT * FROM room_participants WHERE room_id = ? AND session_id = ?
    `).get(room.id, sessionId);

    if (existing) {
      return { success: true, roomId: room.id, reconnected: true };
    }

    // Check capacity
    const count = db.prepare(`
      SELECT COUNT(*) as c FROM room_participants WHERE room_id = ?
    `).get(room.id).c;

    if (count >= 10) {
      return { success: false, error: "This room is full. All 10 team slots are already occupied." };
    }

    if (room.phase !== "LOBBY") {
      return { success: false, error: "This room has already started and is no longer accepting new participants." };
    }

    // Add participant
    db.prepare(`
      INSERT INTO room_participants (id, room_id, session_id, user_name, is_host, joined_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(crypto.randomUUID(), room.id, sessionId, userName, Date.now());

    return { success: true, roomId: room.id, reconnected: false };
  }

  static claimTeam(roomId, sessionId, teamId) {
    let result = { success: false };
    const tx = db.transaction(() => {
      const room = db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomId);
      if (!room || room.phase !== "LOBBY") {
        result = { success: false, error: "Team selection is only available during the LOBBY phase." };
        return;
      }

      // Check if team is already claimed
      const alreadyClaimed = db.prepare(`
        SELECT * FROM room_participants WHERE room_id = ? AND team_id = ?
      `).get(roomId, teamId);

      if (alreadyClaimed) {
        result = { success: false, error: "This team has already been claimed by another participant." };
        return;
      }

      // Assign team to this participant
      db.prepare(`
        UPDATE room_participants SET team_id = ?
        WHERE room_id = ? AND session_id = ?
      `).run(teamId, roomId, sessionId);

      result = { success: true };
    });

    tx();
    return result;
  }
}

