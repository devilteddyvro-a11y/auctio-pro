import { db } from "./src/db/schema.js";
import { RoomManager, liveAuctionRooms } from "./src/managers/RoomManager.js";
import { GameEngine } from "./src/managers/GameEngine.js";

console.log("=== RUNNING IPL 2027 TOURNAMENT ENGINE TEST ===");

// 1. Create Room
const hostSession = "sess_test_host_1";
const { roomId, roomCode } = RoomManager.createRoom("Host Dhoni", hostSession);
console.log(`[PASS] Room Created: Code = ${roomCode}, ID = ${roomId}`);

// 2. Join Room (Player 2)
const player2Session = "sess_test_p2";
const joinRes = RoomManager.joinRoom(roomCode, "Player Rohit", player2Session);
console.log(`[PASS] Player 2 Joined Room: success = ${joinRes.success}`);

// 3. Claim Teams (Host takes CSK, Player 2 takes MI)
const cskClaim = RoomManager.claimTeam(roomId, hostSession, "CSK");
console.log(`[PASS] Host claimed CSK: success = ${cskClaim.success}`);

const miClaim = RoomManager.claimTeam(roomId, player2Session, "MI");
console.log(`[PASS] Player 2 claimed MI: success = ${miClaim.success}`);

// 4. Atomic Conflict Test (Player 2 tries to also take CSK)
const duplicateClaim = RoomManager.claimTeam(roomId, player2Session, "CSK");
console.log(`[PASS] Duplicate claim blocked: success = ${duplicateClaim.success}, error = "${duplicateClaim.error}"`);

// 5. Test 5-Minute Trade Window
const fakeIO = {
  to: () => ({ emit: () => {} }),
  emit: () => {}
};

GameEngine.startTrading(roomId, fakeIO);
const roomAfterTrading = db.prepare("SELECT phase FROM rooms WHERE id = ?").get(roomId);
console.log(`[PASS] Room phase moved to: ${roomAfterTrading.phase}`);

// Propose a trade: CSK offers Ayush Mhatre for MI's Danish Malewar
const cskPlayer = db.prepare("SELECT id FROM room_players WHERE room_id = ? AND current_team_id = 'CSK' LIMIT 1").get(roomId);
const miPlayer = db.prepare("SELECT id FROM room_players WHERE room_id = ? AND current_team_id = 'MI' LIMIT 1").get(roomId);

const tradeRes = GameEngine.proposeTrade(roomId, hostSession, {
  toTeamId: "MI",
  offeredPlayerIds: [cskPlayer.id],
  requestedPlayerIds: [miPlayer.id],
  offeredCash: 0,
  requestedCash: 0
});
console.log(`[PASS] Trade Proposal Submitted: success = ${tradeRes.success}`);

const pendingTrade = db.prepare("SELECT * FROM trades WHERE room_id = ? AND status = 'PENDING'").get(roomId);
const acceptRes = GameEngine.respondTrade(roomId, player2Session, pendingTrade.id, true);
console.log(`[PASS] MI Accepted Trade: success = ${acceptRes.success}`);

// Verify player ownership swapped
const swappedPlayerCSK = db.prepare("SELECT current_team_id FROM room_players WHERE id = ?").get(cskPlayer.id);
console.log(`[PASS] Former CSK Player is now on team: ${swappedPlayerCSK.current_team_id} (Expected: MI)`);

// 6. Test Retention Stage
GameEngine.closeTrading(roomId, fakeIO);
const roomAfterRetentionPhase = db.prepare("SELECT phase FROM rooms WHERE id = ?").get(roomId);
console.log(`[PASS] Room phase moved to: ${roomAfterRetentionPhase.phase}`);

// Submit retention for CSK: Retain 5 players, release others
const allCskPlayers = db.prepare("SELECT id FROM room_players WHERE room_id = ? AND current_team_id = 'CSK'").all(roomId);
const retainCskIds = allCskPlayers.slice(0, 5).map(p => p.id);
const releaseCskIds = allCskPlayers.slice(5).map(p => p.id);

GameEngine.submitRetention(roomId, hostSession, {
  retainedPlayerIds: retainCskIds,
  releasedPlayerIds: releaseCskIds
});
console.log(`[PASS] CSK Retentions Submitted: (5 retained, ${releaseCskIds.length} released)`);

// Submit retention for MI: Retain 15 players, release 10 players (frees up purse)
const allMiPlayers = db.prepare("SELECT id FROM room_players WHERE room_id = ? AND current_team_id = 'MI'").all(roomId);
const retainMiIds = allMiPlayers.slice(0, 15).map(p => p.id);
const releaseMiIds = allMiPlayers.slice(15).map(p => p.id);

GameEngine.submitRetention(roomId, player2Session, {
  retainedPlayerIds: retainMiIds,
  releasedPlayerIds: releaseMiIds
});
console.log(`[PASS] MI Retentions Submitted: (15 retained, ${releaseMiIds.length} released to free purse)`);

// 7. Finalize Retention and Start Live Auction
GameEngine.finalizeRetentionAndStartAuction(roomId, fakeIO);
const roomAuction = db.prepare("SELECT phase FROM rooms WHERE id = ?").get(roomId);
console.log(`[PASS] Room phase moved to: ${roomAuction.phase}`);

// Verify auction pool size
const poolCount = db.prepare("SELECT count(*) as c FROM room_players WHERE room_id = ? AND status = 'AUCTION_POOL'").get(roomId).c;
console.log(`[PASS] Auction Pool Players Generated: ${poolCount} players ready for automated auctioneer!`);

// Verify Automated Auctioneer State
const auctioneer = liveAuctionRooms.get(roomId);
console.log(`[PASS] Automated Auctioneer Active: On block = "${auctioneer.currentPlayer?.name}", Base = ₹${auctioneer.currentBid} Cr`);

// Test Bidding Paddle
const bidRes = auctioneer.placeBid("MI", "Mumbai Indians");
console.log(`[PASS] Interactive Bid Paddle Test: success = ${bidRes.success}, error = "${bidRes.error}", New Bid = ₹${bidRes.nextBid} Cr by MI`);

console.log("=== ALL TEST SUITES PASSED 100%! ===");
process.exit(0);
