import React, { useState } from "react";
import { PlusCircle, LogIn, Trophy, RefreshCw, Cpu, UserCheck } from "lucide-react";

export function LandingPage({ onCreateRoom, onJoinRoom, loading, defaultRoomCode }) {
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem("ipl_auction_user_name");
    if (saved) return saved;
    if (defaultRoomCode) {
      return "Franchise Owner " + Math.floor(10 + Math.random() * 90);
    }
    return "";
  });
  const [error, setError] = useState("");

  const isInvite = Boolean(defaultRoomCode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError("Please enter your display name.");
      return;
    }
    setError("");

    if (isInvite) {
      onJoinRoom(defaultRoomCode, userName.trim());
    } else {
      onCreateRoom(userName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background stadium lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Title & Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-3xl mb-3 shadow-lg shadow-amber-500/5">
            🏏
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight font-teko uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
            IPL 2027 Mega Auction
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Multiplayer Room Platform with Automated AI Auctioneer Bot & Trade Window
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          
          {/* Header Banner depending on whether invited or creating */}
          {isInvite ? (
            <div className="p-3.5 mb-5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
              <div className="text-xs uppercase font-bold text-purple-300">Room Invite Received</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                Room: <span className="text-amber-400">{defaultRoomCode}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Enter your name below to claim an available IPL franchise!
              </div>
            </div>
          ) : (
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold text-white">Create a New Room</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                You'll receive an invite link to share with up to 9 other friends.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Your Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Boss Owner / Coach"
                maxLength={24}
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : isInvite ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Join Room & Claim Franchise</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create IPL Room & Get Invite Link</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 mt-6 text-center">
          <div className="p-3 bg-[#0d1322]/60 border border-slate-800/60 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">10 Teams</div>
            <div className="text-[10px] text-slate-400">2026 Rosters</div>
          </div>
          <div className="p-3 bg-[#0d1322]/60 border border-slate-800/60 rounded-xl">
            <RefreshCw className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">5-Min Trades</div>
            <div className="text-[10px] text-slate-400">Player Swaps</div>
          </div>
          <div className="p-3 bg-[#0d1322]/60 border border-slate-800/60 rounded-xl">
            <Cpu className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Automated Bot</div>
            <div className="text-[10px] text-slate-400">Live Auctioneer</div>
          </div>
        </div>

      </div>
    </div>
  );
}
