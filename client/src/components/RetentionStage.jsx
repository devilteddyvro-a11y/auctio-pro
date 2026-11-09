import React, { useState } from "react";
import { Check, X, ShieldAlert, Sparkles, Coins, Users, Play, Lock } from "lucide-react";

export function RetentionStage({ room, teams, mySessionId, onSubmitRetention, onStartAuction }) {
  const myTeam = teams.find(t => t.ownerSessionId === mySessionId);
  const isHost = room.created_by && myTeam?.ownerName === room.created_by;

  // Track retention decisions locally: { [playerId]: 'RETAIN' | 'RELEASE' }
  const [decisions, setDecisions] = useState(() => {
    const init = {};
    if (myTeam?.squad) {
      for (const p of myTeam.squad) {
        init[p.id] = "RETAIN"; // default retain
      }
    }
    return init;
  });

  const [submitted, setSubmitted] = useState(false);

  const togglePlayer = (pId, status) => {
    if (submitted) return;
    setDecisions(prev => ({
      ...prev,
      [pId]: status
    }));
  };

  // Calculations
  const retainedPlayers = myTeam?.squad?.filter(p => decisions[p.id] === "RETAIN") || [];
  const releasedPlayers = myTeam?.squad?.filter(p => decisions[p.id] === "RELEASE") || [];

  const startingPurse = myTeam?.purse?.starting_purse || 125.0;
  const retentionDeduction = retainedPlayers.reduce((acc, p) => acc + (p.price || 0.30), 0);
  const tradeAdj = myTeam?.purse?.trade_adjustments || 0;
  const estimatedAuctionPurse = Math.max(0, startingPurse - retentionDeduction + tradeAdj);

  const handleSubmit = () => {
    const retainedPlayerIds = retainedPlayers.map(p => p.id);
    const releasedPlayerIds = releasedPlayers.map(p => p.id);

    onSubmitRetention({ retainedPlayerIds, releasedPlayerIds });
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Retention Header Banner */}
      <div className="bg-[#0f172a] border border-purple-500/30 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Retention & Release Phase
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-teko tracking-wide uppercase">
              {myTeam ? `${myTeam.name} Retentions` : "Franchise Retentions"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Decide who stays on your roster and who gets released. 
              <strong className="text-amber-400"> All released players enter the live auction pool</strong> with their base price. 
              Retained players' salaries are deducted from your ₹125 Cr purse.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-end gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-lg shadow-purple-500/20 active:scale-95 transition flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Lock Retentions</span>
              </button>
            ) : (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Retentions Submitted & Locked!</span>
              </div>
            )}

            <button
              onClick={onStartAuction}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Mega-Auction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Financial & Squad Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Retained Players</div>
          <div className="text-2xl font-bold text-emerald-400 font-teko mt-1">
            {retainedPlayers.length} / {myTeam?.squad?.length || 25}
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Released to Auction</div>
          <div className="text-2xl font-bold text-rose-400 font-teko mt-1">
            {releasedPlayers.length}
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Retention Salary Cost</div>
          <div className="text-2xl font-bold text-amber-400 font-teko mt-1">
            -₹{retentionDeduction.toFixed(2)} Cr
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-amber-500/30 bg-amber-500/5 rounded-xl">
          <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Purse for Live Auction</div>
          <div className="text-2xl font-bold text-amber-400 font-teko mt-1">
            ₹{estimatedAuctionPurse.toFixed(2)} Cr
          </div>
        </div>
      </div>

      {/* Player List with Retain / Release Controls */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">
          Manage Squad ({myTeam?.squad?.length || 0} Players)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {myTeam?.squad?.map(player => {
            const isRetained = decisions[player.id] === "RETAIN";

            return (
              <div
                key={player.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isRetained
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-rose-500/5 border-rose-500/30 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5 truncate">
                      {player.name}
                      {player.is_overseas === 1 && <span className="text-[10px]">✈️</span>}
                    </span>
                    <span className="text-sm font-bold text-amber-300 font-teko">
                      ₹{player.price ? player.price.toFixed(2) : "0.30"} Cr
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                    <span className="text-slate-300 font-medium">{player.role}</span>
                    <span>•</span>
                    <span>{player.country}</span>
                  </div>
                </div>

                {/* Toggle Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => togglePlayer(player.id, "RETAIN")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isRetained
                        ? "bg-emerald-500 text-slate-950 shadow"
                        : "bg-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Retain</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => togglePlayer(player.id, "RELEASE")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      !isRetained
                        ? "bg-rose-500 text-white shadow"
                        : "bg-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Release</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

