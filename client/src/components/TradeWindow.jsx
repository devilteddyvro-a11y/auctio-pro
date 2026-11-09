import React, { useState, useEffect } from "react";
import { ArrowLeftRight, Clock, Plus, Check, X, Shield, Coins, AlertCircle } from "lucide-react";

export function TradeWindow({ room, teams, participants = [], trades, mySessionId, onProposeTrade, onRespondTrade, onEndTrading }) {
  const myParticipant = teams.find(t => t.ownerSessionId === mySessionId);
  const myTeam = myParticipant;
  const isHost = participants.find(p => p.session_id === mySessionId)?.is_host === 1;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(300);
  useEffect(() => {
    if (!room.phase_ends_at) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((room.phase_ends_at - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [room.phase_ends_at]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Trade Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState("");
  const [selectedOfferIds, setSelectedOfferIds] = useState([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [offerCash, setOfferCash] = useState(0);

  const targetTeam = teams.find(t => t.id === targetTeamId);

  const handleSendTrade = (e) => {
    e.preventDefault();
    if (!targetTeamId) return;
    if (selectedOfferIds.length === 0 && selectedRequestIds.length === 0) {
      alert("Please select at least one player to offer or request.");
      return;
    }

    onProposeTrade({
      toTeamId: targetTeamId,
      offeredPlayerIds: selectedOfferIds,
      requestedPlayerIds: selectedRequestIds,
      offeredCash: Number(offerCash) || 0,
      requestedCash: 0
    });

    setModalOpen(false);
    setSelectedOfferIds([]);
    setSelectedRequestIds([]);
    setOfferCash(0);
  };

  // Filter Trades for my team
  const myIncoming = trades.filter(t => t.to_team_id === myTeam?.id && t.status === "PENDING");
  const myOutgoing = trades.filter(t => t.from_team_id === myTeam?.id && t.status === "PENDING");
  const completedTrades = trades.filter(t => t.status === "ACCEPTED");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* 5-Minute Timer Header Banner */}
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">Official Trade Window</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-teko tracking-wide uppercase">
              Trading Closes In: <span className="text-amber-400 font-mono">{formatTime(timeLeft)}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Propose player swaps or player + cash trades directly with other franchise owners.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {myTeam && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Propose New Trade</span>
            </button>
          )}

          {isHost && (
            <button
              onClick={onEndTrading}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow"
            >
              Advance to Retentions (Host Only)
            </button>
          )}
        </div>
      </div>

      {/* Trades Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Incoming Proposals */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Incoming Trade Proposals ({myIncoming.length})
          </h2>

          {myIncoming.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No pending incoming trade offers right now.
            </div>
          ) : (
            <div className="space-y-3">
              {myIncoming.map(trade => {
                const fromTeam = teams.find(t => t.id === trade.from_team_id);
                const offeredIds = JSON.parse(trade.offered_player_ids || "[]");
                const requestedIds = JSON.parse(trade.requested_player_ids || "[]");

                const offeredPlayers = fromTeam?.squad?.filter(p => offeredIds.includes(p.id)) || [];
                const requestedPlayers = myTeam?.squad?.filter(p => requestedIds.includes(p.id)) || [];

                return (
                  <div key={trade.id} className="p-4 bg-slate-900 border border-slate-700/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">
                        Proposal from {fromTeam?.name} ({fromTeam?.ownerName})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                        PENDING
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-slate-400">
                        <strong className="text-emerald-400">You Receive:</strong>{" "}
                        {offeredPlayers.map(p => p.name).join(", ") || "None"}
                        {trade.offered_cash > 0 && ` + ₹${trade.offered_cash} Cr`}
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-rose-400">You Give:</strong>{" "}
                        {requestedPlayers.map(p => p.name).join(", ") || "None"}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => onRespondTrade(trade.id, true)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Trade</span>
                      </button>
                      <button
                        onClick={() => onRespondTrade(trade.id, false)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outgoing Proposals */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Your Outgoing Proposals ({myOutgoing.length})
          </h2>

          {myOutgoing.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              You haven't sent any active trade offers yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myOutgoing.map(trade => {
                const toTeam = teams.find(t => t.id === trade.to_team_id);
                return (
                  <div key={trade.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Sent to: {toTeam?.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Waiting for their response...</div>
                    </div>
                    <button
                      onClick={() => onRespondTrade(trade.id, false)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1 rounded bg-rose-500/10"
                    >
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Propose Trade Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-amber-400" />
                <span>Propose Trade</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTrade} className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Select Target Team */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. Select Franchise to Trade With
                </label>
                <select
                  value={targetTeamId}
                  onChange={(e) => {
                    setTargetTeamId(e.target.value);
                    setSelectedRequestIds([]);
                  }}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose Franchise --</option>
                  {teams.filter(t => t.id !== myTeam?.id).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.ownerName || "Unclaimed"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Your Players to Offer */}
              {myTeam && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                    2. Select Your Player(s) to Offer
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                    {myTeam.squad?.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-slate-300 p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOfferIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedOfferIds([...selectedOfferIds, p.id]);
                            else setSelectedOfferIds(selectedOfferIds.filter(id => id !== p.id));
                          }}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span className="truncate">{p.name} ({p.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Their Players to Request */}
              {targetTeam && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5">
                    3. Select Their Player(s) You Want
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                    {targetTeam.squad?.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-slate-300 p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRequestIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRequestIds([...selectedRequestIds, p.id]);
                            else setSelectedRequestIds(selectedRequestIds.filter(id => id !== p.id));
                          }}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span className="truncate">{p.name} ({p.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Cash */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  4. Additional Cash (Optional, in ₹ Cr from your purse)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={myTeam?.purse?.purse_remaining || 0}
                  value={offerCash}
                  onChange={(e) => setOfferCash(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

