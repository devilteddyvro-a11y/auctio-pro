import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../auction.db");

// Initialize Database
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    -- Teams canonical table
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      color TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      logo_text TEXT NOT NULL
    );

    -- Master Players table
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      country TEXT NOT NULL,
      is_overseas INTEGER NOT NULL, -- 0 or 1
      default_price REAL NOT NULL DEFAULT 0.30, -- in Cr
      starting_team_id TEXT,
      acquisition_type TEXT, -- Retained, Auction, Trade, NewPool
      base_price REAL DEFAULT 0.30,
      FOREIGN KEY (starting_team_id) REFERENCES teams(id)
    );

    -- Rooms table
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT UNIQUE NOT NULL,
      created_by TEXT NOT NULL,
      phase TEXT NOT NULL DEFAULT 'LOBBY', -- LOBBY, TRADING, RETENTION, PURSE, AUCTION, COMPLETED
      max_participants INTEGER DEFAULT 10,
      phase_started_at INTEGER,
      phase_ends_at INTEGER,
      starting_purse REAL DEFAULT 125.0,
      created_at INTEGER NOT NULL
    );

    -- Room Participants (Strict: 1 per team, max 10 per room)
    CREATE TABLE IF NOT EXISTS room_participants (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      team_id TEXT,
      is_host INTEGER DEFAULT 0,
      retention_confirmed INTEGER DEFAULT 0,
      joined_at INTEGER NOT NULL,
      UNIQUE(room_id, session_id),
      UNIQUE(room_id, team_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    -- Room Players (Instance of players in a specific room)
    CREATE TABLE IF NOT EXISTS room_players (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      current_team_id TEXT,
      status TEXT NOT NULL, -- SQUAD, RELEASED, AUCTION_POOL, SOLD, UNSOLD
      price REAL NOT NULL,
      former_team_id TEXT, -- for RTM
      auction_order INTEGER,
      UNIQUE(room_id, player_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (current_team_id) REFERENCES teams(id)
    );

    -- Room Purses
    CREATE TABLE IF NOT EXISTS room_purses (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      starting_purse REAL DEFAULT 125.0,
      contract_deductions REAL DEFAULT 0.0,
      trade_adjustments REAL DEFAULT 0.0,
      auction_spent REAL DEFAULT 0.0,
      purse_remaining REAL DEFAULT 125.0,
      rtm_remaining INTEGER DEFAULT 1,
      UNIQUE(room_id, team_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    -- Trades
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      from_team_id TEXT NOT NULL,
      to_team_id TEXT NOT NULL,
      offered_player_ids TEXT NOT NULL, -- JSON array
      offered_cash REAL DEFAULT 0.0,
      requested_player_ids TEXT NOT NULL, -- JSON array
      requested_cash REAL DEFAULT 0.0,
      status TEXT NOT NULL, -- PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED
      created_at INTEGER NOT NULL,
      resolved_at INTEGER,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    -- Auction Bids
    CREATE TABLE IF NOT EXISTS auction_bids (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      bid_amount REAL NOT NULL,
      is_rtm INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    -- Room Audit Events
    CREATE TABLE IF NOT EXISTS room_events (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      actor_team_id TEXT,
      payload TEXT, -- JSON
      created_at INTEGER NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec("ALTER TABLE room_participants ADD COLUMN retention_confirmed INTEGER DEFAULT 0;");
  } catch (e) {
    // Column already exists
  }

  console.log("SQLite schema initialized successfully.");
}

