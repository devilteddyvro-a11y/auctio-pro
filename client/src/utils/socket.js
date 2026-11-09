import { io } from "socket.io-client";

// Connect to current origin automatically (works for localhost, Wi-Fi IP, and cloud/tunnel)
export const socket = io(window.location.origin, {
  autoConnect: true,
  reconnection: true
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
