import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  Trophy, Shield, Users, Check, AlertCircle, Sparkles, Edit3, Eye, 
  Crown, Star, X, CheckCircle2, ChevronRight, AlertTriangle 
} from "lucide-react";

// Exact 10 franchise layout sequence as drawn in user sketch:
// Row 1: CSK, RCB, MI, PBKS, RR
// Row 2: GT, LSG, SRH, DC, KKR
const ROW_1_TEAM_IDS = ["CSK", "RCB", "MI", "PBKS", "RR"];
const ROW_2_TEAM_IDS = ["GT", "LSG", "SRH", "DC", "KKR"];

export function FinalLineupBoard({
  room,
  teams = [],
  mySessionId,
  onSubmitLineup
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedXI, setSelectedXI] = useState([]); // Array of 11 player IDs
  const [captainId, setCaptainId] = useState(null);
  const [wicketkeeperId, setWicketkeeperId] = useState(null);
  const [selectedImpact, setSelectedImpact] = useState([]); // Array of 4 player IDs
  const [selectedSubs, setSelectedSubs] = useState([]); // Array of 2 player IDs
  const [validationError, setValidationError] = useState("");

  const myTeam = teams.find(t => t.ownerSessionId === mySessionId);
  const mySquad = myTeam?.squad || [];
  const myLineup = myTeam?.lineup || null;
  const isEligible = mySquad.length >= 18;

  // Initialize or edit modal state
  const handleOpenBuilder = () => {
    if (!isEligible) {
      alert("Your squad has fewer than 18 players and is not eligible for squad selection.");
      return;
    }

    if (myLineup) {
      setSelectedXI(myLineup.playing_11_ids || []);
      setCaptainId(myLineup.captain_id || null);
      setWicketkeeperId(myLineup.wicketkeeper_id || null);
      setSelectedImpact(myLineup.impact_player_ids || []);
      setSelectedSubs(myLineup.substitute_ids || []);
    } else {
      // Auto-populate initial 11, 4 impact, 2 subs from squad as smart defaults
      const autoXI = mySquad.slice(0, 11).map(p => p.player_id);
      const autoImpact = mySquad.slice(11, 15).map(p => p.player_id);
      const autoSubs = mySquad.slice(15, 17).map(p => p.player_id);
      
      const defaultWK = mySquad.find(p => autoXI.includes(p.player_id) && p.role === "Wicketkeeper")?.player_id || autoXI[0];
      const defaultC = autoXI.find(id => id !== defaultWK) || autoXI[0];

      setSelectedXI(autoXI);
      setSelectedImpact(autoImpact);
      setSelectedSubs(autoSubs);
      setCaptainId(defaultC);
      setWicketkeeperId(defaultWK);
    }

    setValidationError("");
    setModalOpen(true);
  };

  // Toggle selection helpers
  const toggleXI = (playerId) => {
    setValidationError("");
    if (selectedXI.includes(playerId)) {
      setSelectedXI(prev => prev.filter(id => id !== playerId));
      if (captainId === playerId) setCaptainId(null);
      if (wicketkeeperId === playerId) setWicketkeeperId(null);
    } else {
      if (selectedXI.length >= 11) {
        setValidationError("Playing XI is full (11 players). Deselect one first.");
        return;
      }
      // Cannot be in impact or subs
      if (selectedImpact.includes(playerId) || selectedSubs.includes(playerId)) {
        setValidationError("Player is already selected as an Impact or Substitute player.");
        return;
      }
      setSelectedXI(prev => [...prev, playerId]);
    }
  };

  const toggleImpact = (playerId) => {
    setValidationError("");
    if (selectedImpact.includes(playerId)) {
      setSelectedImpact(prev => prev.filter(id => id !== playerId));
    } else {
      if (selectedImpact.length >= 4) {
        setValidationError("Impact players list is full (4 players). Deselect one first.");
        return;
      }
      if (selectedXI.includes(playerId) || selectedSubs.includes(playerId)) {
        setValidationError("Player is already selected in Playing XI or Substitutes.");
        return;
      }
      setSelectedImpact(prev => [...prev, playerId]);
    }
  };

  const toggleSub = (playerId) => {
    setValidationError("");
    if (selectedSubs.includes(playerId)) {
      setSelectedSubs(prev => prev.filter(id => id !== playerId));
    } else {
      if (selectedSubs.length >= 2) {
        setValidationError("Substitutes list is full (2 players). Deselect one first.");
        return;
      }
      if (selectedXI.includes(playerId) || selectedImpact.includes(playerId)) {
        setValidationError("Player is already selected in Playing XI or Impact list.");
        return;
      }
      setSelectedSubs(prev => [...prev, playerId]);
    }
  };

  // Validate and submit
  const handleSaveLineup = () => {
    if (selectedXI.length !== 11) {
      setValidationError("You must select exactly 11 players for your Playing XI.");
      return;
    }

    const overseasInXI = mySquad.filter(p => selectedXI.includes(p.player_id) && p.is_overseas === 1).length;
    if (overseasInXI > 4) {
      setValidationError(`Maximum 4 overseas players allowed in Playing XI. Currently selected: ${overseasInXI}`);
      return;
    }

    if (!captainId || !selectedXI.includes(captainId)) {
      setValidationError("You must designate a Captain (C) from your Playing XI.");
      return;
    }

    if (!wicketkeeperId || !selectedXI.includes(wicketkeeperId)) {
      setValidationError("You must designate a Wicketkeeper (WK) from your Playing XI.");
      return;
    }

    if (selectedImpact.length !== 4) {
      setValidationError("You must select exactly 4 Impact Players.");
      return;
    }

    if (selectedSubs.length !== 2) {
      setValidationError("You must select exactly 2 Substitutes.");
      return;
    }

    onSubmitLineup({
      teamId: myTeam.id,
      playing11Ids: selectedXI,
      captainId,
      wicketkeeperId,
      impactPlayerIds: selectedImpact,
      substituteIds: selectedSubs
    });

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setModalOpen(false);
  };

  // Helper to get ordered list of teams for a row
  const getTeamsForRow = (teamIds) => {
    return teamIds.map(id => teams.find(t => t.id === id) || { id, name: id, short_name: id, squad: [] });
  };

  const row1Teams = getTeamsForRow(ROW_1_TEAM_IDS);
  const row2Teams = getTeamsForRow(ROW_2_TEAM_IDS);

  const publishedCount = teams.filter(t => t.lineup).length;

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner: Stage Title & User Action */}
      <div className="bg-gradient-to-r from-[#0b101e] via-[#0f172a] to-[#0b101e] border-2 border-amber-400/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official IPL 2027 Roster Board</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-teko tracking-wide uppercase">
              Final Team Lineups & Playing 11s
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Auction concluded! Franchises with 18+ players have published their official Starting XI, 
              4 Impact Players, and 2 Substitutes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lineups Published</div>
              <div className="text-xl font-black text-amber-400 font-teko">
                {publishedCount} / {teams.length}
              </div>
            </div>

            {myTeam && (
              isEligible ? (
                <button
                  onClick={handleOpenBuilder}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition flex items-center gap-2 uppercase tracking-wider font-teko text-lg"
                >
                  {myLineup ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  <span>{myLineup ? `Edit ${myTeam.short_name} Lineup` : `Post Your Playing 17 (${myTeam.short_name})`}</span>
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Your squad has {mySquad.length}/18 players (Ineligible)</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 10 FRANCHISES DISPLAY GRID (Hand-drawn layout): 2 Rows of 5 Columns */}
      <div className="space-y-6">
        
        {/* ROW 1: CSK, RCB, MI, PBKS, RR */}
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span>Franchises: CSK • RCB • MI • PBKS • RR</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
            {row1Teams.map(team => (
              <TeamLineupCard 
                key={team.id} 
                team={team} 
                isMyTeam={team.id === myTeam?.id}
                onOpenBuilder={handleOpenBuilder}
              />
            ))}
          </div>
        </div>

        {/* ROW 2: GT, LSG, SRH, DC, KKR */}
        <div>
          <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span>Franchises: GT • LSG • SRH • DC • KKR</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
            {row2Teams.map(team => (
              <TeamLineupCard 
                key={team.id} 
                team={team} 
                isMyTeam={team.id === myTeam?.id}
                onOpenBuilder={handleOpenBuilder}
              />
            ))}
          </div>
        </div>

      </div>

      {/* INTERACTIVE LINEUP BUILDER MODAL */}
      {modalOpen && myTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b101e] border-2 border-amber-400/40 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-xl">
                  {myTeam.logo_text || "🏏"}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-teko uppercase tracking-wide">
                    Build Official Lineup — {myTeam.name}
                  </h3>
                  <div className="text-xs text-slate-400">
                    Select 11 for Starting XI, 4 Impact Players, and 2 Substitutes (Total: 17 of {mySquad.length})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Banner if any */}
            {validationError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Selection Status Ticker */}
            <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <span className={`font-bold ${selectedXI.length === 11 ? "text-emerald-400" : "text-amber-400"}`}>
                  Playing XI: {selectedXI.length} / 11
                </span>
                <span className="text-slate-400">•</span>
                <span className={`font-bold ${
                  mySquad.filter(p => selectedXI.includes(p.player_id) && p.is_overseas === 1).length <= 4 
                    ? "text-sky-400" 
                    : "text-rose-400"
                }`}>
                  Overseas in XI: {mySquad.filter(p => selectedXI.includes(p.player_id) && p.is_overseas === 1).length} / 4 Max
                </span>
                <span className="text-slate-400">•</span>
                <span className={`font-bold ${selectedImpact.length === 4 ? "text-emerald-400" : "text-purple-400"}`}>
                  Impact: {selectedImpact.length} / 4
                </span>
                <span className="text-slate-400">•</span>
                <span className={`font-bold ${selectedSubs.length === 2 ? "text-emerald-400" : "text-slate-300"}`}>
                  Subs: {selectedSubs.length} / 2
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400">Roles:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${captainId ? "bg-amber-400/20 text-amber-300" : "bg-slate-800 text-slate-500"}`}>
                  👑 Captain: {mySquad.find(p => p.player_id === captainId)?.name || "Not set"}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${wicketkeeperId ? "bg-sky-400/20 text-sky-300" : "bg-slate-800 text-slate-500"}`}>
                  🧤 WK: {mySquad.find(p => p.player_id === wicketkeeperId)?.name || "Not set"}
                </span>
              </div>
            </div>

            {/* Player Selection Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {mySquad.map((player) => {
                  const inXI = selectedXI.includes(player.player_id);
                  const inImpact = selectedImpact.includes(player.player_id);
                  const inSubs = selectedSubs.includes(player.player_id);
                  const isC = captainId === player.player_id;
                  const isWK = wicketkeeperId === player.player_id;

                  return (
                    <div
                      key={player.player_id}
                      className={`p-3 rounded-2xl border transition flex flex-wrap items-center justify-between gap-3 ${
                        inXI
                          ? "bg-amber-500/10 border-amber-400/50"
                          : inImpact
                          ? "bg-purple-500/10 border-purple-500/40"
                          : inSubs
                          ? "bg-sky-500/10 border-sky-500/40"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Left: Player Info */}
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sm shadow">
                          {player.role === "Batter" ? "🏏" : player.role === "Bowler" ? "🎯" : player.role === "Wicketkeeper" ? "🧤" : "⚡"}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{player.name}</span>
                            {player.is_overseas === 1 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                                ✈️ OS
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {player.role} • {player.country} • ₹{player.price?.toFixed(2)} Cr
                          </div>
                        </div>
                      </div>

                      {/* Middle: Captain / WK Designation (Only active if in Playing XI) */}
                      {inXI && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCaptainId(isC ? null : player.player_id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              isC
                                ? "bg-amber-400 text-slate-950 shadow shadow-amber-400/30"
                                : "bg-slate-800 text-slate-400 hover:text-amber-300"
                            }`}
                            title="Designate as Captain"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isC ? "Captain (C)" : "Set C"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setWicketkeeperId(isWK ? null : player.player_id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                              isWK
                                ? "bg-sky-400 text-slate-950 shadow shadow-sky-400/30"
                                : "bg-slate-800 text-slate-400 hover:text-sky-300"
                            }`}
                            title="Designate as Wicketkeeper"
                          >
                            <span>🧤</span>
                            <span>{isWK ? "Keeper (WK)" : "Set WK"}</span>
                          </button>
                        </div>
                      )}

                      {/* Right: Slot Assignment Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleXI(player.player_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            inXI
                              ? "bg-amber-400 text-slate-950 shadow"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {inXI ? "✓ Playing XI" : "+ Playing XI"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleImpact(player.player_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            inImpact
                              ? "bg-purple-500 text-white shadow"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {inImpact ? "✓ Impact" : "+ Impact"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSub(player.player_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            inSubs
                              ? "bg-sky-500 text-slate-950 shadow"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {inSubs ? "✓ Sub" : "+ Sub"}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#0a0f1d] border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                11 in XI + 4 Impact + 2 Subs = 17 players total.
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLineup}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publish Lineup</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// INDIVIDUAL TEAM COLUMN CARD (Matches User Sketch)
function TeamLineupCard({ team, isMyTeam, onOpenBuilder }) {
  const squad = team.squad || [];
  const lineup = team.lineup || null;
  const isEligible = squad.length >= 18;

  // Resolve player objects
  const squadMap = {};
  for (const p of squad) {
    squadMap[p.player_id] = p;
  }

  const playing11Players = lineup?.playing_11_ids?.map(id => squadMap[id]).filter(Boolean) || [];
  const impactPlayers = lineup?.impact_player_ids?.map(id => squadMap[id]).filter(Boolean) || [];
  const substitutePlayers = lineup?.substitute_ids?.map(id => squadMap[id]).filter(Boolean) || [];

  return (
    <div
      className={`rounded-3xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 ${
        isMyTeam
          ? "bg-[#0d1527] border-amber-400 ring-2 ring-amber-400/30"
          : "bg-[#0b101e] border-slate-800/90 hover:border-slate-700"
      }`}
    >
      {/* Team Header */}
      <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-xl shadow-inner">
              {team.logo_text || "🏏"}
            </div>
            <div>
              <div className="text-xl font-black text-white font-teko uppercase leading-none">
                {team.short_name}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {team.name}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              isEligible ? "bg-slate-800 text-slate-300" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}>
              {squad.length} Players
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Owner: <strong className="text-slate-200">{team.ownerName || "AI Franchise"}</strong></span>
          {isMyTeam && (
            <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-[9px]">
              YOU
            </span>
          )}
        </div>
      </div>

      {/* Body: Player List or Ineligible Banner */}
      <div className="p-3.5 flex-1 flex flex-col justify-between text-xs space-y-3">
        
        {!isEligible ? (
          /* Case 1: Ineligible (< 18 players) */
          <div className="py-10 px-3 text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              Not Eligible
            </div>
            <p className="text-[11px] text-slate-400">
              Squad size is only {squad.length} players. Minimum 18 required for squad selection.
            </p>
          </div>
        ) : lineup ? (
          /* Case 2: Lineup Published */
          <div className="space-y-3">
            
            {/* Playing XI List */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center justify-between">
                <span>Playing XI (11)</span>
                <span className="text-slate-500 font-mono text-[9px]">
                  OS: {playing11Players.filter(p => p.is_overseas === 1).length}/4
                </span>
              </div>

              <div className="space-y-1">
                {playing11Players.map((player, idx) => {
                  const isC = lineup.captain_id === player.player_id;
                  const isWK = lineup.wicketkeeper_id === player.player_id;

                  return (
                    <div
                      key={player.player_id}
                      className="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[9px] font-mono text-slate-500 w-3">{idx + 1}.</span>
                        <span className="text-slate-100 font-medium truncate">{player.name}</span>
                        {player.is_overseas === 1 && (
                          <span className="text-[8px] text-sky-400">✈️</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isC && (
                          <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] leading-tight">
                            C
                          </span>
                        )}
                        {isWK && (
                          <span className="px-1 py-0.2 rounded bg-sky-400 text-slate-950 font-black text-[9px] leading-tight">
                            WK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact Players (4) */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                Impact Players (4)
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {impactPlayers.map(player => (
                  <div key={player.player_id} className="p-1 rounded bg-purple-500/10 border border-purple-500/20 truncate text-slate-200">
                    {player.name} {player.is_overseas === 1 ? "✈️" : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Substitutes (2) */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Substitutes (2)
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {substitutePlayers.map(player => (
                  <div key={player.player_id} className="p-1 rounded bg-slate-800/70 border border-slate-700/60 truncate text-slate-300">
                    {player.name}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Case 3: Eligible but Not Published yet */
          <div className="py-12 px-3 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <Sparkles className="w-6 h-6 text-slate-500 mx-auto animate-pulse" />
            <div className="text-xs font-semibold text-slate-300">
              {isMyTeam ? "You haven't posted your 11 yet" : "Drafting Lineup..."}
            </div>
            <p className="text-[10px] text-slate-500">
              {isMyTeam ? "Pick 11 starting players, 4 impact, and 2 substitutes to share." : "Waiting for owner to publish official team."}
            </p>
            {isMyTeam && (
              <button
                onClick={onOpenBuilder}
                className="mt-2 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow"
              >
                Create Lineup Now
              </button>
            )}
          </div>
        )}

      </div>

      {/* Card Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-center">
        {lineup ? (
          <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lineup Official & Published</span>
          </span>
        ) : isEligible ? (
          <span className="text-[10px] text-amber-400/80 font-mono">
            Lineup Pending
          </span>
        ) : (
          <span className="text-[10px] text-rose-400 font-mono">
            Disqualified
          </span>
        )}
      </div>

    </div>
  );
}

