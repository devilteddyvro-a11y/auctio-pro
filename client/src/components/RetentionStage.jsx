import React, { useState } from "react";
import { Check, X, ShieldAlert, Sparkles, Coins, Users, Play, Lock, AlertCircle, Clock, ShieldCheck } from "lucide-react";

export function RetentionStage({ room, teams, participants = [], mySessionId, onSubmitRetention, onStartAuction }) {
  const myParticipant = participants.find(p => p.session_id === mySessionId);
  const myTeam = teams.find(t => t.ownerSessionId === mySessionId);
  const isHost = myParticipant?.is_host === 1;

  // Claimed teams list
  const claimedTeams = teams.filter(t => t.claimed);
  const confirmedTeams = claimedTeams.filter(t => t.retentionConfirmed);
  const allConfirmed = claimedTeams.length > 0 && confirmedTeams.length === claimedTeams.length;

  // Track player retention decisions: { [playerId]: 'RETAIN' | 'RELEASE' }
  const [decisions, setDecisions] = useState({});
  const [uncappedSelectedId, setUncappedSelectedId] = useState(null);
  const [errorBanner, setErrorBanner] = useState("");

  const isConfirmed = Boolean(myTeam?.retentionConfirmed);

  // Helper to determine if an Indian player qualifies as Uncapped (base/price <= 4.0 Cr and not overseas)
  const isUncappedEligible = (player) => {
    return player.is_overseas === 0 && (player.price <= 4.0 || player.name.includes("Dhoni"));
  };

  // Currently retained players
  const squad = myTeam?.squad || [];
  const retainedPlayers = squad.filter(p => decisions[p.id] === "RETAIN");
  const releasedPlayers = squad.filter(p => decisions[p.id] !== "RETAIN");

  // Calculate capped and uncapped count
  let uncappedCount = 0;
  let cappedCount = 0;
  for (const p of retainedPlayers) {
    if (p.id === uncappedSelectedId && isUncappedEligible(p)) {
      uncappedCount++;
    } else {
      cappedCount++;
    }
  }

  const togglePlayerRetention = (player) => {
    if (isConfirmed) return;
    setErrorBanner("");

    const currentlyRetained = decisions[player.id] === "RETAIN";

    if (currentlyRetained) {
      // Release player
      setDecisions(prev => {
        const next = { ...prev };
        delete next[player.id];
        return next;
      });
      if (player.id === uncappedSelectedId) {
        setUncappedSelectedId(null);
      }
    } else {
      // Trying to retain
      if (retainedPlayers.length >= 6) {
        setErrorBanner("Maximum retention limit is 6 players total.");
        return;
      }

      const eligibleAsUncapped = isUncappedEligible(player);

      if (eligibleAsUncapped && uncappedCount === 0) {
        // Automatically assign to uncapped slot if uncapped slot is free
        setUncappedSelectedId(player.id);
        setDecisions(prev => ({ ...prev, [player.id]: "RETAIN" }));
      } else {
        // Must go to capped slot
        if (cappedCount >= 5) {
          setErrorBanner("Maximum 5 capped players allowed. You can only add 1 uncapped player (Indian with salary ≤ ₹4.0 Cr).");
          return;
        }
        setDecisions(prev => ({ ...prev, [player.id]: "RETAIN" }));
      }
    }
  };

  // Financial calculations
  const startingPurse = myTeam?.purse?.starting_purse || 125.0;
  const retentionDeduction = retainedPlayers.reduce((acc, p) => acc + (p.price || 0.30), 0);
  const tradeAdj = myTeam?.purse?.trade_adjustments || 0;
  const estimatedAuctionPurse = Math.max(0, startingPurse - retentionDeduction + tradeAdj);

  const handleConfirmRetention = () => {
    if (retainedPlayers.length > 6) {
      setErrorBanner("Maximum retention limit is 6 players.");
      return;
    }
    if (cappedCount > 5) {
      setErrorBanner("Maximum 5 capped players allowed.");
      return;
    }
    if (uncappedCount > 1) {
      setErrorBanner("Maximum 1 uncapped player allowed.");
      return;
    }

    const retainedPlayerIds = retainedPlayers.map(p => p.id);
    const releasedPlayerIds = squad.filter(p => !retainedPlayerIds.includes(p.id)).map(p => p.id);

    onSubmitRetention({
      retainedPlayerIds,
      releasedPlayerIds,
      uncappedPlayerId: uncappedSelectedId
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Retention Header Banner */}
      <div className="bg-[#0f172a] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Official Retention Phase
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-teko tracking-wide uppercase">
              {myTeam ? `${myTeam.name} Retentions` : "Franchise Retentions"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Official IPL Rules: <strong className="text-amber-300">Maximum 6 players (Only 5 Capped + 1 Uncapped)</strong>.
              All non-retained players automatically enter the live auction pool.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-end gap-3">
            {!isConfirmed ? (
              <button
                onClick={handleConfirmRetention}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-2 font-teko text-lg uppercase tracking-wider"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Retention ({retainedPlayers.length}/6 Players)</span>
              </button>
            ) : (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Your Retentions Confirmed & Locked!</span>
              </div>
            )}

            {isHost && (
              <button
                onClick={onStartAuction}
                disabled={!allConfirmed}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  allConfirmed
                    ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer animate-pulse"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{allConfirmed ? "Launch Live Mega-Auction (Host)" : "Launch Auction (Locked Until All Confirm)"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Confirmation Gate Status Card */}
      <div className={`p-5 rounded-2xl border transition shadow-xl ${
        allConfirmed 
          ? "bg-emerald-500/10 border-emerald-500/30" 
          : "bg-amber-500/10 border-amber-500/30"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            {allConfirmed ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <Lock className="w-6 h-6 text-amber-400" />
            )}
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {allConfirmed 
                  ? "All Franchises Have Confirmed Retentions!" 
                  : "Bidding Phase Strictly Locked Until All Players Confirm"}
              </h3>
              <p className="text-xs text-slate-300">
                {allConfirmed
                  ? "The host can now launch the live auction floor!"
                  : `Waiting for all franchise owners to confirm their retention list. (${confirmedTeams.length} of ${claimedTeams.length} confirmed)`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400 block">Progress</span>
            <span className="text-2xl font-bold font-teko text-amber-400">
              {confirmedTeams.length} / {claimedTeams.length} Franchises
            </span>
          </div>
        </div>

        {/* Live List of Claimed Teams and their Confirmation Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800/80">
          {claimedTeams.map(team => {
            const confirmed = team.retentionConfirmed;
            return (
              <div 
                key={team.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  confirmed 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm">{team.logo_text || "🏏"}</span>
                  <span className="font-bold truncate">{team.short_name}</span>
                </div>
                <div className="shrink-0 ml-1">
                  {confirmed ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-400/90 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> Deciding
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retention Slot Limit Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Slot Limit */}
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-2xl shadow">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Total Retentions</div>
          <div className="text-2xl font-extrabold text-white font-teko mt-1">
            <span className={retainedPlayers.length === 6 ? "text-amber-400" : "text-emerald-400"}>
              {retainedPlayers.length}
            </span> / 6 Max
          </div>
        </div>

        {/* Capped Slot Limit */}
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-2xl shadow">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Capped Players</div>
          <div className="text-2xl font-extrabold font-teko mt-1 text-sky-400">
            {cappedCount} / 5 Max
          </div>
        </div>

        {/* Uncapped Slot Limit */}
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-2xl shadow">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Uncapped Player</div>
          <div className="text-2xl font-extrabold font-teko mt-1 text-purple-400">
            {uncappedCount} / 1 Max
          </div>
        </div>

        {/* Live Auction Purse Left */}
        <div className="p-4 bg-[#0f172a] border border-amber-500/30 bg-amber-500/5 rounded-2xl shadow">
          <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Purse for Auction</div>
          <div className="text-2xl font-extrabold text-amber-400 font-teko mt-1">
            ₹{estimatedAuctionPurse.toFixed(2)} Cr
          </div>
        </div>
      </div>

      {errorBanner && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Squad Player Selection Grid */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            Select Up to 6 Players to Retain ({squad.length} Available)
          </h2>
          <span className="text-xs text-slate-400">
            {isConfirmed ? "🔒 Retention locked" : "Click 'Retain' to select"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {squad.map(player => {
            const isRetained = decisions[player.id] === "RETAIN";
            const isUncapped = isUncappedEligible(player);
            const isCurrentUncappedSlot = player.id === uncappedSelectedId;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isRetained
                    ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5 truncate">
                      {player.name}
                      {player.is_overseas === 1 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20">
                          ✈️ Overseas
                        </span>
                      )}
                    </span>
                    <span className="text-base font-bold text-amber-300 font-teko">
                      ₹{player.price ? player.price.toFixed(2) : "0.30"} Cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>{player.role} • {player.country}</span>
                    {isUncapped ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                        Uncapped Eligible
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        Capped
                      </span>
                    )}
                  </div>
                </div>

                {/* Retain / Release Toggle Button */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    disabled={isConfirmed}
                    onClick={() => togglePlayerRetention(player)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isConfirmed
                        ? isRetained
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                          : "bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed"
                        : isRetained
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {isRetained ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Retained {isCurrentUncappedSlot ? "(Uncapped Slot)" : "(Capped Slot)"}</span>
                      </>
                    ) : (
                      <span>Select to Retain</span>
                    )}
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
