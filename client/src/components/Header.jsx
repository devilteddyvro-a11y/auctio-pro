import React, { useState } from "react";
import { Copy, Check, Users, Shield, AlertOctagon } from "lucide-react";

export function Header({ room, participants, mySessionId, onOpenSquadModal, myTeam, onAbandonRoom }) {
  const [copied, setCopied] = useState(false);
  const isHost = participants.find(p => p.session_id === mySessionId)?.is_host === 1;

  const copyInvite = () => {
    const url = window.location.origin + "?room=" + room.room_code;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPhaseBadge = (phase) => {
    switch (phase) {
      case "LOBBY":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">Phase: Lobby</span>;
      case "TRADING":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">Phase: 5-Min Trade Window</span>;
      case "RETENTION":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">Phase: Retentions</span>;
      case "AUCTION":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">Phase: Live Auction Floor</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">Phase: {phase}</span>;
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0c1222]/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Room Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏏</span>
            <span className="text-lg font-black tracking-tight font-teko text-amber-400 uppercase">
              IPL 2027 Auction
            </span>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Room Code Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-xs text-slate-400">Room:</span>
            <span className="text-xs font-mono font-bold text-amber-300 tracking-wider">{room.room_code}</span>
            <button
              onClick={copyInvite}
              title="Copy Room Link"
              className="text-slate-400 hover:text-white transition p-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {getPhaseBadge(room.phase)}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Claimed Team Badge */}
          {myTeam ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700">
              <span className="text-sm">{myTeam.logo_text}</span>
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold leading-none">Your Franchise</div>
                <div className="text-xs font-extrabold text-amber-300">{myTeam.name}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-400/90 px-2 py-1 bg-amber-400/10 rounded border border-amber-400/20">
              Select your team below
            </div>
          )}

          {/* Global Squads Drawer Toggle */}
          <button
            onClick={onOpenSquadModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>All 10 Rosters</span>
          </button>

          {/* Admin Abandon Room Button */}
          {isHost && (
            <button
              onClick={() => {
                if (window.confirm("⚠️ Are you sure you want to ABANDON this room?\n\nThis will immediately end the auction for ALL participants and return everyone to the home screen.")) {
                  onAbandonRoom();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 hover:text-rose-300 text-xs font-bold transition shadow"
              title="End and abandon this room for everyone"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Abandon Room</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

