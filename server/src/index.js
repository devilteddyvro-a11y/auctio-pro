import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { db } from "./db/schema.js";
import { seedMasterData } from "./db/seed.js";
import { RoomManager, liveAuctionRooms } from "./managers/RoomManager.js";
import { GameEngine, AutomatedAuctioneer } from "./managers/GameEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static frontend assets if built
const clientDistPath = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Ensure DB is initialized and seeded on start
seedMasterData();

// REST API Endpoints
app.post("/api/rooms", (req, res) => {
  const { hostName, sessionId } = req.body;
  if (!hostName || !sessionId) {
    return res.status(400).json({ error: "hostName and sessionId are required." });
  }
  const result = RoomManager.createRoom(hostName, sessionId);
  res.json(result);
});

app.post("/api/rooms/join", (req, res) => {
  const { roomCode, userName, sessionId } = req.body;
  if (!roomCode || !userName || !sessionId) {
    return res.status(400).json({ error: "roomCode, userName, and sessionId are required." });
  }
  const result = RoomManager.joinRoom(roomCode, userName, sessionId);
  if (!result.success) {
    return res.status(400).json(result);
  }
  // Immediately notify all connected players in the room that someone joined
  const state = RoomManager.getFullRoomState(result.roomId);
  if (state) {
    io.to(result.roomId).emit("ROOM_STATE_UPDATED", state);
  }
  res.json(result);
});

app.get("/api/rooms/:roomId", (req, res) => {
  const state = RoomManager.getFullRoomState(req.params.roomId);
  if (!state) {
    return res.status(404).json({ error: "Room not found." });
  }
  res.json(state);
});

// Socket.io Real-time Handlers
io.on("connection", (socket) => {
  let currentRoomId = null;
  let currentSessionId = null;

  socket.on("JOIN_ROOM", ({ roomId, sessionId }) => {
    currentRoomId = roomId;
    currentSessionId = sessionId;
    socket.join(roomId);

    // Auto-revive auctioneer if room is in AUCTION phase but not active in memory
    const room = db.prepare("SELECT phase FROM rooms WHERE id = ?").get(roomId);
    if (room && room.phase === "AUCTION" && !liveAuctionRooms.has(roomId)) {
      const auctioneer = new AutomatedAuctioneer(roomId, io);
      liveAuctionRooms.set(roomId, auctioneer);
      auctioneer.start();
    }

    // Send latest full room state to everyone in the room
    const state = RoomManager.getFullRoomState(roomId);
    if (state) {
      io.to(roomId).emit("ROOM_STATE_UPDATED", state);
    }
  });

  socket.on("CLAIM_TEAM", ({ roomId, sessionId, teamId }) => {
    const result = RoomManager.claimTeam(roomId, sessionId, teamId);
    if (result.success) {
      io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));
    } else {
      socket.emit("ACTION_ERROR", result.error);
    }
  });

  socket.on("START_TRADING", ({ roomId }) => {
    GameEngine.startTrading(roomId, io);
  });

  socket.on("ADVANCE_TO_RETENTION", ({ roomId, sessionId }) => {
    const participant = db.prepare("SELECT is_host FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || participant.is_host !== 1) {
      socket.emit("ACTION_ERROR", "Only the room owner can advance to the retention phase.");
      return;
    }
    GameEngine.closeTrading(roomId, io);
  });

  socket.on("PROPOSE_TRADE", ({ roomId, sessionId, tradeData }) => {
    const result = GameEngine.proposeTrade(roomId, sessionId, tradeData);
    if (result.success) {
      io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));
    } else {
      socket.emit("ACTION_ERROR", result.error);
    }
  });

  socket.on("RESPOND_TRADE", ({ roomId, sessionId, tradeId, accept }) => {
    const result = GameEngine.respondTrade(roomId, sessionId, tradeId, accept);
    if (result.success) {
      io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));
    } else {
      socket.emit("ACTION_ERROR", result.error);
    }
  });

  socket.on("SUBMIT_RETENTION", ({ roomId, sessionId, data }) => {
    const result = GameEngine.submitRetention(roomId, sessionId, data);
    if (result.success) {
      io.to(roomId).emit("ROOM_STATE_UPDATED", RoomManager.getFullRoomState(roomId));
    } else {
      socket.emit("ACTION_ERROR", result.error);
    }
  });

  socket.on("FINALIZE_RETENTION_START_AUCTION", ({ roomId, sessionId }) => {
    const participant = db.prepare("SELECT is_host FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || participant.is_host !== 1) {
      socket.emit("ACTION_ERROR", "Only the room owner can launch the live auction.");
      return;
    }
    const result = GameEngine.finalizeRetentionAndStartAuction(roomId, io);
    if (result && !result.success) {
      socket.emit("ACTION_ERROR", result.error);
    }
  });

  socket.on("RESUME_AUCTION", ({ roomId }) => {
    let auctioneer = liveAuctionRooms.get(roomId);
    if (!auctioneer) {
      auctioneer = new AutomatedAuctioneer(roomId, io);
      liveAuctionRooms.set(roomId, auctioneer);
    }
    auctioneer.nextPlayer();
  });

  socket.on("PLACE_BID", ({ roomId, teamId, teamName }) => {
    const auctioneer = liveAuctionRooms.get(roomId);
    if (auctioneer) {
      const result = auctioneer.placeBid(teamId, teamName);
      if (!result.success) {
        socket.emit("ACTION_ERROR", result.error);
      }
    }
  });

  socket.on("EXERCISE_RTM", ({ roomId, teamId, teamName }) => {
    const auctioneer = liveAuctionRooms.get(roomId);
    if (auctioneer) {
      auctioneer.exerciseRTM(teamId, teamName);
    }
  });

  socket.on("DECLINE_RTM", ({ roomId, teamId }) => {
    const auctioneer = liveAuctionRooms.get(roomId);
    if (auctioneer) {
      auctioneer.declineRTM(teamId);
    }
  });

  socket.on("VOTE_END_BIDDING", ({ roomId, sessionId, vote }) => {
    if (!roomId || !sessionId) return;
    const participant = db.prepare("SELECT * FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || !participant.team_id) {
      socket.emit("ACTION_ERROR", "Only claimed franchise owners can vote to end bidding.");
      return;
    }

    db.prepare("UPDATE room_participants SET vote_end_bidding = ? WHERE room_id = ? AND session_id = ?")
      .run(vote ? 1 : 0, roomId, sessionId);

    // Check if majority is reached
    const state = RoomManager.getFullRoomState(roomId);
    if (state && state.endBiddingVotes && state.endBiddingVotes.isMajority) {
      // Majority voted to end bidding! Transition room to COMPLETED phase
      db.prepare("UPDATE rooms SET phase = 'COMPLETED', phase_ends_at = NULL WHERE id = ?").run(roomId);
      const auctioneer = liveAuctionRooms.get(roomId);
      if (auctioneer) {
        auctioneer.stop();
        liveAuctionRooms.delete(roomId);
      }
      const finalState = RoomManager.getFullRoomState(roomId);
      io.to(roomId).emit("ROOM_STATE_UPDATED", finalState);
    } else if (state) {
      io.to(roomId).emit("ROOM_STATE_UPDATED", state);
    }
  });

  socket.on("SUBMIT_LINEUP", ({ roomId, sessionId, teamId, playing11Ids, captainId, wicketkeeperId, impactPlayerIds, substituteIds }) => {
    if (!roomId || !sessionId || !teamId) return;
    const participant = db.prepare("SELECT * FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || participant.team_id !== teamId) {
      socket.emit("ACTION_ERROR", "You can only submit a lineup for your own franchise.");
      return;
    }

    // Check squad size >= 18
    const squad = db.prepare(`
      SELECT rp.player_id, pl.is_overseas, pl.role
      FROM room_players rp
      JOIN players pl ON rp.player_id = pl.id
      WHERE rp.room_id = ? AND rp.current_team_id = ? AND rp.status = 'SQUAD'
    `).all(roomId, teamId);

    if (squad.length < 18) {
      socket.emit("ACTION_ERROR", "Cannot submit lineup: Squad has less than 18 players and is ineligible.");
      return;
    }

    if (!Array.isArray(playing11Ids) || playing11Ids.length !== 11) {
      socket.emit("ACTION_ERROR", "Playing XI must have exactly 11 players.");
      return;
    }
    if (!captainId || !playing11Ids.includes(captainId)) {
      socket.emit("ACTION_ERROR", "You must designate a Captain from your Playing XI.");
      return;
    }
    if (!wicketkeeperId || !playing11Ids.includes(wicketkeeperId)) {
      socket.emit("ACTION_ERROR", "You must designate a Wicketkeeper from your Playing XI.");
      return;
    }
    if (!Array.isArray(impactPlayerIds) || impactPlayerIds.length !== 4) {
      socket.emit("ACTION_ERROR", "You must select exactly 4 Impact Players.");
      return;
    }
    if (!Array.isArray(substituteIds) || substituteIds.length !== 2) {
      socket.emit("ACTION_ERROR", "You must select exactly 2 Substitutes.");
      return;
    }

    // Check overseas in Playing XI <= 4
    const overseasInXI = squad.filter(p => playing11Ids.includes(p.player_id) && p.is_overseas === 1).length;
    if (overseasInXI > 4) {
      socket.emit("ACTION_ERROR", `Playing XI cannot have more than 4 overseas players (Selected: ${overseasInXI}).`);
      return;
    }

    // Check duplicates among selected 17
    const allSelected = [...playing11Ids, ...impactPlayerIds, ...substituteIds];
    const uniqueSelected = new Set(allSelected);
    if (uniqueSelected.size !== 17) {
      socket.emit("ACTION_ERROR", "Duplicate players detected across Playing XI, Impact Players, and Substitutes.");
      return;
    }

    const lineupId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO team_lineups (id, room_id, team_id, playing_11_ids, captain_id, wicketkeeper_id, impact_player_ids, substitute_ids, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(room_id, team_id) DO UPDATE SET
        playing_11_ids = excluded.playing_11_ids,
        captain_id = excluded.captain_id,
        wicketkeeper_id = excluded.wicketkeeper_id,
        impact_player_ids = excluded.impact_player_ids,
        substitute_ids = excluded.substitute_ids,
        submitted_at = excluded.submitted_at
    `).run(
      lineupId,
      roomId,
      teamId,
      JSON.stringify(playing11Ids),
      captainId,
      wicketkeeperId,
      JSON.stringify(impactPlayerIds),
      JSON.stringify(substituteIds),
      Date.now()
    );

    const updatedState = RoomManager.getFullRoomState(roomId);
    io.to(roomId).emit("ROOM_STATE_UPDATED", updatedState);
  });

  socket.on("SEND_CHAT", ({ roomId, senderName, teamName, text }) => {
    if (!roomId || !text || !text.trim()) return;
    const chatMsg = {
      id: crypto.randomUUID(),
      senderName: senderName || "Player",
      teamName: teamName || null,
      text: text.trim().substring(0, 250),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    io.to(roomId).emit("CHAT_MESSAGE", chatMsg);
  });

  socket.on("ABANDON_ROOM", ({ roomId, sessionId }) => {
    if (!roomId) return;
    const participant = db.prepare("SELECT is_host FROM room_participants WHERE room_id = ? AND session_id = ?").get(roomId, sessionId);
    if (!participant || participant.is_host !== 1) {
      socket.emit("ACTION_ERROR", "Only the room admin/host can abandon the room.");
      return;
    }

    const auctioneer = liveAuctionRooms.get(roomId);
    if (auctioneer) {
      auctioneer.stop();
      liveAuctionRooms.delete(roomId);
    }

    db.prepare("UPDATE rooms SET phase = 'ENDED' WHERE id = ?").run(roomId);
    io.to(roomId).emit("ROOM_ABANDONED");
  });
});

// Fallback to client SPA index.html
if (fs.existsSync(clientDistPath)) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`IPL 2027 Auction Engine listening on http://localhost:${PORT}`);
});
