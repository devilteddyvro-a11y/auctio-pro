import { db } from "../db/schema.js";
import { RoomManager, liveAuctionRooms } from "./RoomManager.js";
import crypto from "crypto";

export class AutomatedAuctioneer {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.io = io;
    this.timerInterval = null;
    this.currentPlayer = null;
    this.currentBid = 0;
    this.highestBidderTeamId = null;
    this.highestBidderTeamName = null;
    this.timer = 15;
    this.status = "IDLE"; // INTRODUCING, BIDDING, GOING_1, GOING_2, RTM_CHECK, SOLD, UNSOLD, FINISHED
    this.announcement = "";
    this.rtmFormerTeamId = null;
    this.rtmFormerTeamName = null;
    this.rtmTimer = 10;
  }

  getState() {
    return {
      currentPlayer: this.currentPlayer,
      currentBid: this.currentBid,
      highestBidderTeamId: this.highestBidderTeamId,
      highestBidderTeamName: this.highestBidderTeamName,
      timer: this.timer,
      status: this.status,
      announcement: this.announcement,
      rtmFormerTeamId: this.rtmFormerTeamId,
      rtmFormerTeamName: this.rtmFormerTeamName,
      rtmTimer: this.rtmTimer
    };
  }

  broadcastState() {
    this.io.to(this.roomId).emit("AUCTION_TICK", this.getState());
  }

  start() {
    this.nextPlayer();
  }

  nextPlayer() {
    clearInterval(this.timerInterval);

    // Pick next available player in AUCTION_POOL for this room
    const nextItem = db.prepare(`
      SELECT rp.*, pl.name, pl.role, pl.country, pl.is_overseas, pl.base_price, t.name as former_team_name, t.short_name as former_team_short
      FROM room_players rp
      JOIN players pl ON rp.player_id = pl.id
      LEFT JOIN teams t ON rp.former_team_id = t.id
      WHERE rp.room_id = ? AND rp.status = 'AUCTION_POOL'
      ORDER BY rp.price DESC, pl.base_price DESC
      LIMIT 1
    `).get(this.roomId);

    if (!nextItem) {
      this.status = "FINISHED";
      this.announcement = "The IPL 2027 Auction has concluded! All sets are complete.";
      this.currentPlayer = null;
      this.broadcastState();
      this.io.to(this.roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(this.roomId));
      return;
    }

    this.currentPlayer = nextItem;
    this.currentBid = nextItem.base_price || 0.30;
    this.highestBidderTeamId = null;
    this.highestBidderTeamName = null;
    this.rtmFormerTeamId = nextItem.former_team_id || null;
    this.rtmFormerTeamName = nextItem.former_team_name || null;
    this.timer = 15;
    this.status = "INTRODUCING";
    this.announcement = `Welcome to the auction block: ${nextItem.name} (${nextItem.role}, ${nextItem.is_overseas ? "Overseas" : "India"}). Base price ₹${this.currentBid.toFixed(2)} Cr!`;

    this.broadcastState();

    setTimeout(() => {
      this.status = "BIDDING";
      this.announcement = `Bidding is now open for ${nextItem.name}! Base price ₹${this.currentBid.toFixed(2)} Cr.`;
      this.broadcastState();
      this.startCountdown();
    }, 2500);
  }

  startCountdown() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status === "RTM_CHECK") {
        this.rtmTimer--;
        if (this.rtmTimer <= 0) {
          // RTM expired -> finalize sale to original highest bidder
          this.finalizeSale(this.highestBidderTeamId, this.highestBidderTeamName, false);
        } else {
          this.broadcastState();
        }
        return;
      }

      this.timer--;

      if (this.timer === 8) {
        if (this.highestBidderTeamId) {
          this.status = "GOING_1";
          this.announcement = `Going once at ₹${this.currentBid.toFixed(2)} Cr to ${this.highestBidderTeamName}...`;
        } else {
          this.announcement = `Any bids for ${this.currentPlayer.name} at ₹${this.currentBid.toFixed(2)} Cr?`;
        }
      } else if (this.timer === 4) {
        if (this.highestBidderTeamId) {
          this.status = "GOING_2";
          this.announcement = `Going twice at ₹${this.currentBid.toFixed(2)} Cr to ${this.highestBidderTeamName}... Final call!`;
        } else {
          this.announcement = `Final call for ${this.currentPlayer.name}!`;
        }
      } else if (this.timer <= 0) {
        clearInterval(this.timerInterval);

        if (this.highestBidderTeamId) {
          // Check RTM eligibility
          const formerTeam = this.rtmFormerTeamId;
          if (formerTeam && formerTeam !== this.highestBidderTeamId) {
            const purse = db.prepare("SELECT * FROM room_purses WHERE room_id = ? AND team_id = ?").get(this.roomId, formerTeam);
            if (purse && purse.rtm_remaining > 0 && purse.purse_remaining >= this.currentBid) {
              this.status = "RTM_CHECK";
              this.rtmTimer = 10;
              this.announcement = `RTM Triggered! ${this.rtmFormerTeamName} has 10 seconds to exercise their Right to Match at ₹${this.currentBid.toFixed(2)} Cr!`;
              this.broadcastState();
              this.timerInterval = setInterval(() => {
                this.rtmTimer--;
                if (this.rtmTimer <= 0) {
                  clearInterval(this.timerInterval);
                  this.finalizeSale(this.highestBidderTeamId, this.highestBidderTeamName, false);
                } else {
                  this.broadcastState();
                }
              }, 1000);
              return;
            }
          }

          // No RTM or not eligible -> finalize sale
          this.finalizeSale(this.highestBidderTeamId, this.highestBidderTeamName, false);
        } else {
          // Unsold
          this.status = "UNSOLD";
          this.announcement = `${this.currentPlayer.name} remains UNSOLD!`;

          db.prepare(`
            UPDATE room_players SET status = 'UNSOLD' WHERE id = ?
          `).run(this.currentPlayer.id);

          this.broadcastState();
          this.io.to(this.roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(this.roomId));

          setTimeout(() => {
            this.nextPlayer();
          }, 3500);
        }
      }

      this.broadcastState();
    }, 1000);
  }

  placeBid(teamId, teamName) {
    if (this.status !== "BIDDING" && this.status !== "GOING_1" && this.status !== "GOING_2" && this.status !== "INTRODUCING") {
      return { success: false, error: "Bidding is currently closed for this player." };
    }

    if (this.highestBidderTeamId === teamId) {
      return { success: false, error: "Your team currently holds the highest bid!" };
    }

    // Calculate next bid amount
    let nextBid = 0;
    if (!this.highestBidderTeamId) {
      nextBid = this.currentPlayer.base_price;
    } else {
      let inc = 0.10;
      if (this.currentBid >= 5.0) inc = 0.50;
      else if (this.currentBid >= 2.0) inc = 0.25;
      else if (this.currentBid >= 1.0) inc = 0.20;
      nextBid = Number((this.currentBid + inc).toFixed(2));
    }

    // Validate squad & purse rules
    const purse = db.prepare("SELECT * FROM room_purses WHERE room_id = ? AND team_id = ?").get(this.roomId, teamId);
    if (!purse || purse.purse_remaining < nextBid) {
      return { success: false, error: `Insufficient purse! Remaining: ₹${purse ? purse.purse_remaining.toFixed(2) : 0} Cr.` };
    }

    // Squad limit check (max 25)
    const currentSquadCount = db.prepare(`
      SELECT count(*) as c FROM room_players WHERE room_id = ? AND current_team_id = ? AND status = 'SQUAD'
    `).get(this.roomId, teamId).c;

    if (currentSquadCount >= 25) {
      return { success: false, error: "Maximum squad limit of 25 players already reached!" };
    }

    // Overseas limit check (max 8)
    if (this.currentPlayer.is_overseas) {
      const overseasCount = db.prepare(`
        SELECT count(*) as c FROM room_players rp
        JOIN players pl ON rp.player_id = pl.id
        WHERE rp.room_id = ? AND rp.current_team_id = ? AND rp.status = 'SQUAD' AND pl.is_overseas = 1
      `).get(this.roomId, teamId).c;

      if (overseasCount >= 8) {
        return { success: false, error: "Maximum overseas limit of 8 players already reached!" };
      }
    }

    // Reserve calculation for min 18 players
    const needed = Math.max(0, 18 - (currentSquadCount + 1));
    const reserveNeeded = needed * 0.30;
    if ((purse.purse_remaining - nextBid) < reserveNeeded) {
      return { success: false, error: `Cannot bid! Must keep at least ₹${reserveNeeded.toFixed(2)} Cr reserve to reach minimum 18 players.` };
    }

    // Accept Bid
    this.currentBid = nextBid;
    this.highestBidderTeamId = teamId;
    this.highestBidderTeamName = teamName;
    this.timer = 12; // Reset countdown
    this.status = "BIDDING";
    this.announcement = `Bid of ₹${nextBid.toFixed(2)} Cr placed by ${teamName}!`;

    db.prepare(`
      INSERT INTO auction_bids (id, room_id, player_id, team_id, bid_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), this.roomId, this.currentPlayer.player_id, teamId, nextBid, Date.now());

    this.broadcastState();
    return { success: true, nextBid };
  }

  exerciseRTM(teamId, teamName) {
    if (this.status !== "RTM_CHECK" || teamId !== this.rtmFormerTeamId) {
      return { success: false, error: "RTM is not active for your team." };
    }

    clearInterval(this.timerInterval);
    this.finalizeSale(teamId, teamName, true);
    return { success: true };
  }

  declineRTM(teamId) {
    if (this.status !== "RTM_CHECK" || teamId !== this.rtmFormerTeamId) {
      return { success: false, error: "RTM is not active for your team." };
    }

    clearInterval(this.timerInterval);
    this.finalizeSale(this.highestBidderTeamId, this.highestBidderTeamName, false);
    return { success: true };
  }

  finalizeSale(winningTeamId, winningTeamName, viaRTM = false) {
    this.status = "SOLD";
    this.announcement = `SOLD! ${this.currentPlayer.name} sold to ${winningTeamName} for ₹${this.currentBid.toFixed(2)} Cr${viaRTM ? " (via RTM!)" : "!"}`;

    const tx = db.transaction(() => {
      // 1. Assign player to team
      db.prepare(`
        UPDATE room_players
        SET status = 'SQUAD', current_team_id = ?, price = ?
        WHERE id = ?
      `).run(winningTeamId, this.currentBid, this.currentPlayer.id);

      // 2. Deduct purse
      db.prepare(`
        UPDATE room_purses
        SET auction_spent = auction_spent + ?,
            purse_remaining = purse_remaining - ?,
            rtm_remaining = CASE WHEN ? = 1 THEN rtm_remaining - 1 ELSE rtm_remaining END
        WHERE room_id = ? AND team_id = ?
      `).run(this.currentBid, this.currentBid, viaRTM ? 1 : 0, this.roomId, winningTeamId);

      // 3. Log event
      db.prepare(`
        INSERT INTO room_events (id, room_id, event_type, actor_team_id, payload, created_at)
        VALUES (?, ?, 'AUCTION_SOLD', ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        this.roomId,
        winningTeamId,
        JSON.stringify({ player: this.currentPlayer, price: this.currentBid, viaRTM }),
        Date.now()
      );
    });

    tx();

    this.broadcastState();
    this.io.to(this.roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(this.roomId));

    setTimeout(() => {
      this.nextPlayer();
    }, 4000);
  }
}

export class GameEngine {
  static startTrading(roomId, io) {
    const duration = 300; // 5 minutes (300 seconds)
    const endsAt = Date.now() + duration * 1000;

    db.prepare(`
      UPDATE rooms
      SET phase = 'TRADING', phase_started_at = ?, phase_ends_at = ?
      WHERE id = ?
    `).run(Date.now(), endsAt, roomId);

    io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));

    // Server-authoritative timer for 300 seconds
    setTimeout(() => {
      const room = db.prepare("SELECT phase FROM rooms WHERE id = ?").get(roomId);
      if (room && room.phase === "TRADING") {
        this.closeTrading(roomId, io);
      }
    }, duration * 1000);
  }

  static closeTrading(roomId, io) {
    // Expire all pending trades
    db.prepare(`
      UPDATE trades SET status = 'EXPIRED' WHERE room_id = ? AND status = 'PENDING'
    `).run(roomId);

    db.prepare(`
      UPDATE rooms SET phase = 'RETENTION', phase_started_at = ?, phase_ends_at = NULL WHERE id = ?
    `).run(Date.now(), roomId);

    io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));
  }

  static proposeTrade(roomId, sessionId, { toTeamId, offeredPlayerIds, requestedPlayerIds, offeredCash, requestedCash }) {
    const participant = db.prepare("SELECT * FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || !participant.team_id) {
      return { success: false, error: "Only claimed team owners can propose trades." };
    }

    const fromTeamId = participant.team_id;
    if (fromTeamId === toTeamId) {
      return { success: false, error: "Cannot trade with your own team." };
    }

    const tradeId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO trades (id, room_id, from_team_id, to_team_id, offered_player_ids, requested_player_ids, offered_cash, requested_cash, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(
      tradeId,
      roomId,
      fromTeamId,
      toTeamId,
      JSON.stringify(offeredPlayerIds || []),
      JSON.stringify(requestedPlayerIds || []),
      Number(offeredCash || 0),
      Number(requestedCash || 0),
      Date.now()
    );

    return { success: true };
  }

  static respondTrade(roomId, sessionId, tradeId, accept) {
    const participant = db.prepare("SELECT * FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || !participant.team_id) {
      return { success: false, error: "Unauthorized." };
    }

    const trade = db.prepare("SELECT * FROM trades WHERE id = ? AND room_id = ?").get(tradeId, roomId);
    if (!trade || trade.status !== "PENDING") {
      return { success: false, error: "Trade is no longer pending." };
    }

    if (trade.to_team_id !== participant.team_id) {
      return { success: false, error: "Only the receiving team can respond to this trade proposal." };
    }

    let result = { success: false };

    if (!accept) {
      db.prepare("UPDATE trades SET status = 'REJECTED', resolved_at = ? WHERE id = ?").run(Date.now(), tradeId);
      return { success: true };
    }

    // Atomic trade transfer
    const tx = db.transaction(() => {
      const offeredIds = JSON.parse(trade.offered_player_ids);
      const requestedIds = JSON.parse(trade.requested_player_ids);

      // Transfer offered players to recipient
      for (const pId of offeredIds) {
        db.prepare(`
          UPDATE room_players SET current_team_id = ? WHERE room_id = ? AND id = ?
        `).run(trade.to_team_id, roomId, pId);
      }

      // Transfer requested players to sender
      for (const pId of requestedIds) {
        db.prepare(`
          UPDATE room_players SET current_team_id = ? WHERE room_id = ? AND id = ?
        `).run(trade.from_team_id, roomId, pId);
      }

      // Cash adjustments
      if (trade.offered_cash > 0) {
        db.prepare(`UPDATE room_purses SET trade_adjustments = trade_adjustments - ? WHERE room_id = ? AND team_id = ?`).run(trade.offered_cash, roomId, trade.from_team_id);
        db.prepare(`UPDATE room_purses SET trade_adjustments = trade_adjustments + ? WHERE room_id = ? AND team_id = ?`).run(trade.offered_cash, roomId, trade.to_team_id);
      }
      if (trade.requested_cash > 0) {
        db.prepare(`UPDATE room_purses SET trade_adjustments = trade_adjustments + ? WHERE room_id = ? AND team_id = ?`).run(trade.requested_cash, roomId, trade.from_team_id);
        db.prepare(`UPDATE room_purses SET trade_adjustments = trade_adjustments - ? WHERE room_id = ? AND team_id = ?`).run(trade.requested_cash, roomId, trade.to_team_id);
      }

      db.prepare("UPDATE trades SET status = 'ACCEPTED', resolved_at = ? WHERE id = ?").run(Date.now(), tradeId);
      result = { success: true };
    });

    tx();
    return result;
  }

  static submitRetention(roomId, sessionId, { retainedPlayerIds, releasedPlayerIds }) {
    const participant = db.prepare("SELECT * FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || !participant.team_id) {
      return { success: false, error: "Unauthorized." };
    }

    const teamId = participant.team_id;

    const tx = db.transaction(() => {
      // Mark released players
      for (const id of releasedPlayerIds) {
        db.prepare(`
          UPDATE room_players
          SET status = 'RELEASED', former_team_id = current_team_id, current_team_id = NULL
          WHERE room_id = ? AND id = ?
        `).run(roomId, id);
      }

      // Mark retained players
      for (const id of retainedPlayerIds) {
        db.prepare(`
          UPDATE room_players
          SET status = 'SQUAD'
          WHERE room_id = ? AND id = ?
        `).run(roomId, id);
      }
    });

    tx();
    return { success: true };
  }

  static finalizeRetentionAndStartAuction(roomId, io) {
    const tx = db.transaction(() => {
      // 1. Calculate each team's contract deductions & purse
      const teams = db.prepare("SELECT id FROM teams").all();
      for (const t of teams) {
        const retainedCost = db.prepare(`
          SELECT COALESCE(SUM(price), 0) as total
          FROM room_players
          WHERE room_id = ? AND current_team_id = ? AND status = 'SQUAD'
        `).get(roomId, t.id).total;

        db.prepare(`
          UPDATE room_purses
          SET contract_deductions = ?,
              purse_remaining = starting_purse - ? + trade_adjustments
          WHERE room_id = ? AND team_id = ?
        `).run(retainedCost, retainedCost, roomId, t.id);
      }

      // 2. Put all released players into AUCTION_POOL
      db.prepare(`
        UPDATE room_players SET status = 'AUCTION_POOL' WHERE room_id = ? AND status = 'RELEASED'
      `).run(roomId);

      // 3. Add New Pool Candidates from master players who aren't in this room yet
      const newPoolMaster = db.prepare(`
        SELECT * FROM players WHERE starting_team_id IS NULL
      `).all();

      const insertPool = db.prepare(`
        INSERT OR IGNORE INTO room_players (id, room_id, player_id, current_team_id, status, price, former_team_id)
        VALUES (?, ?, ?, NULL, 'AUCTION_POOL', ?, NULL)
      `);

      for (const p of newPoolMaster) {
        insertPool.run(crypto.randomUUID(), roomId, p.id, p.default_price);
      }

      // 4. Update room phase to AUCTION
      db.prepare(`
        UPDATE rooms SET phase = 'AUCTION', phase_started_at = ? WHERE id = ?
      `).run(Date.now(), roomId);
    });

    tx();

    // 5. Initialize & start Automated Auctioneer
    const auctioneer = new AutomatedAuctioneer(roomId, io);
    liveAuctionRooms.set(roomId, auctioneer);
    auctioneer.start();

    io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));
  }
}
