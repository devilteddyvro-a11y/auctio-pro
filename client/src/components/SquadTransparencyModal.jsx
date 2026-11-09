import React, { useState } from "react";
import { X, Users, Globe, Coins, Shield } from "lucide-react";

export function SquadTransparencyModal({ isOpen, onClose, teams, myTeamId }) {
  const [selectedTeamId, setSelectedTeamId] = useState(myTeamId || (teams && teams[0]?.id) || "CSK");

  if (!isOpen || !teams) return null;

  const currentTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0f172a] border border-slate-700/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131b2e]">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-wide">All Franchise Rosters & Purses</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex overflow-x-auto gap-2 p-3 bg-[#0a0f1d] border-b border-slate-800 scrollbar-none">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                selectedTeamId === team.id
                  ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow-sm"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-sm">{team.logo_text}</span>
              <span>{team.short_name}</span>
              {team.id === myTeamId && (
                <span className="text-[10px] px-1 bg-amber-500/20 text-amber-300 rounded font-normal">You</span>
              )}
            </button>
          ))}
        </div>

        {/* Team Summary Cards */}
        {currentTeam && (
          <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTeam.logo_text}</span>
                <h3 className="text-xl font-bold text-white">{currentTeam.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Owner: <span className="font-medium text-slate-200">{currentTeam.ownerName || "Unclaimed"}</span>
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">Remaining Purse</div>
                  <div className="text-lg font-bold text-amber-300 font-teko tracking-wide">
                    ₹{currentTeam.purse ? currentTeam.purse.purse_remaining.toFixed(2) : "125.00"} Cr
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">Overseas</div>
                  <div className={`text-base font-bold ${currentTeam.overseasCount >= 8 ? "text-rose-400" : "text-sky-300"}`}>
                    {currentTeam.overseasCount} / 8 Max
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">Squad Size</div>
                  <div className="text-base font-bold text-emerald-300">
                    {currentTeam.squadSize} / 25
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Roster Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTeam && currentTeam.squad && currentTeam.squad.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentTeam.squad.map((player, idx) => (
                <div 
                  key={player.id || idx}
                  className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between hover:border-slate-600 transition"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                      {player.name}
                      {player.is_overseas === 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-normal">
                          ✈️ Overseas
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="text-amber-400/90 font-medium">{player.role}</span>
                      <span>•</span>
                      <span>{player.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-teko">
                      ₹{player.price ? player.price.toFixed(2) : "0.30"} Cr
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      {player.orig_acq || "Squad"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              No players currently in this squad.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

