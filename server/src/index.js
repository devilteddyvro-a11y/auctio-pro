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

  socket.on("ADVANCE_TO_RETENTION", ({ roomId }) => {
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

  socket.on("FINALIZE_RETENTION_START_AUCTION", ({ roomId }) => {
    GameEngine.finalizeRetentionAndStartAuction(roomId, io);
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
      if (auctioneer.timerInterval) clearInterval(auctioneer.timerInterval);
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
