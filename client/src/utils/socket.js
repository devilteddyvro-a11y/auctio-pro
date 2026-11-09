import { io } from "socket.io-client";

// Resolve connection target:
// If Vite dev server on port 3000 or 5173, point directly to backend port 4000
const socketUrl =
  window.location.port === "3000" || window.location.port === "5173"
    ? `http://${window.location.hostname}:4000`
    : window.location.origin;

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"]
});

// Helper for session token
export function getOrCreateSessionId() {
  let id = localStorage.getItem("ipl_auction_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem("ipl_auction_session_id", id);
  }
  return id;
}

export function getSavedUserName() {
  return localStorage.getItem("ipl_auction_user_name") || "";
}

export function saveUserName(name) {
  localStorage.setItem("ipl_auction_user_name", name);
}
