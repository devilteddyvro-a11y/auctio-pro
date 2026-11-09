import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  Gavel, Clock, Flame, Sparkles, Volume2, VolumeX, AlertCircle, 
  MessageSquare, Send, Users, Shield, DollarSign, Globe, X, ChevronRight, UserCheck
} from "lucide-react";

export function LiveAuctionFloor({ 
  room, 
  teams, 
  liveAuction, 
  mySessionId, 
  userName,
  chatMessages = [],
  onSendChat,
  onPlaceBid, 
  onExerciseRTM, 
  onDeclineRTM, 
  onResumeAuction 
}) {
  const myTeam = teams.find(t => t.ownerSessionId === mySessionId);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "squad" | "details"
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Confetti on SOLD
  useEffect(() => {
    if (liveAuction?.status === "SOLD") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [liveAuction?.status]);

  // Web Speech Synthesis (Automated Spoken Auctioneer)
  useEffect(() => {
    if (!soundEnabled || !liveAuction?.announcement) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(liveAuction.announcement);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [liveAuction?.announcement, soundEnabled]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !onSendChat) return;
    onSendChat(chatInput);
    setChatInput("");
  };

  // If no active auction or waiting for next player
  if (!liveAuction || liveAuction.status === "IDLE" || !liveAuction.currentPlayer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex p-5 rounded-3xl bg-amber-400/10 text-amber-400 mb-4 animate-bounce border border-amber-400/20 shadow-lg shadow-amber-500/10">
          <Gavel className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-extrabold text-white font-teko uppercase tracking-wide">
          Auction Floor Ready
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto mb-6">
          The automated hammer is on standby. Click below to bring the next player to the block!
        </p>
        <button
          onClick={onResumeAuction}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition inline-flex items-center gap-2 uppercase tracking-wider font-teko text-lg"
        >
          <Gavel className="w-5 h-5" />
          <span>Bring Next Player to the Block</span>
        </button>
      </div>
    );
  }

  const { 
    currentPlayer, 
    currentBid = 0, 
    highestBidderTeamId, 
    highestBidderTeamName, 
    timer = 0, 
    status, 
    announcement, 
    rtmFormerTeamId, 
    rtmTimer 
  } = liveAuction;

  const isLeading = highestBidderTeamId === myTeam?.id;
  const isMyRTM = rtmFormerTeamId === myTeam?.id && status === "RTM_CHECK";

  // Highest bidder team object
  const leadingTeam = teams.find(t => t.id === highestBidderTeamId);

  // Calculate next bid increment
  let nextBid = 0;
  if (!highestBidderTeamId) {
    nextBid = currentPlayer.base_price;
  } else {
    let inc = 0.10;
    if (currentBid >= 5.0) inc = 0.50;
    else if (currentBid >= 2.0) inc = 0.25;
    else if (currentBid >= 1.0) inc = 0.20;
    nextBid = Number((currentBid + inc).toFixed(2));
  }

  // Validation rules for bidding paddle
  const myPurseRemaining = myTeam?.purse?.purse_remaining || 0;
  const myOverseasCount = myTeam?.overseasCount || 0;
  const mySquadSize = myTeam?.squadSize || 0;

  const canAfford = myPurseRemaining >= nextBid;
  const overseasOk = !currentPlayer.is_overseas || myOverseasCount < 8;
  const squadOk = mySquadSize < 25;

  const neededFor18 = Math.max(0, 18 - (mySquadSize + 1));
  const reserveNeeded = neededFor18 * 0.30;
  const reserveOk = (myPurseRemaining - nextBid) >= reserveNeeded;

  const canBid = myTeam && !isLeading && canAfford && overseasOk && squadOk && reserveOk && 
    (status === "BIDDING" || status === "GOING_1" || status === "GOING_2");

  let bidErrorReason = "";
  if (!myTeam) bidErrorReason = "You haven't claimed a team.";
  else if (isLeading) bidErrorReason = "You hold the highest bid!";
  else if (!canAfford) bidErrorReason = `Purse too low (₹${myPurseRemaining.toFixed(2)} Cr left).`;
  else if (!overseasOk) bidErrorReason = "Overseas limit reached (8/8).";
  else if (!squadOk) bidErrorReason = "Squad limit reached (25/25).";
  else if (!reserveOk) bidErrorReason = `Need ₹${reserveNeeded.toFixed(2)} Cr reserve for 18 players.`;

  // Sorted list of 10 franchises for circular dial layout
  const dialTeams = teams.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">
      
      {/* Top Header: Voice Ticker Bar & Audio Control */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Gavel className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
              Automated Auctioneer Bot
            </div>
            <div className="text-sm font-semibold text-slate-100 italic">
              "{announcement || 'Bidding is now open!'}"
            </div>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
            soundEnabled
              ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
          title="Toggle Voice Announcements"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
        </button>
      </div>

      {/* Main Floor Grid: Left = Wheel/Dial & Status, Right = Sidebar Tabs (Chat & Squads) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT / CENTER: Circular Franchise Dial & Action Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Top Status Cards: Current Bid & Leading Bidder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Current Highest Bid */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-amber-400" /> Current Bid
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-teko tracking-tight mt-0.5">
                  ₹{currentBid.toFixed(2)} <span className="text-xl text-slate-300 font-sans">Cr</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Base Price: <strong className="text-slate-200">₹{currentPlayer.base_price?.toFixed(2) || "0.30"} Cr</strong>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  status === "GOING_2" ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse" :
                  status === "GOING_1" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                  status === "SOLD" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" :
                  status === "UNSOLD" ? "bg-slate-800 text-slate-400 border-slate-700" :
                  "bg-sky-500/20 text-sky-300 border-sky-500/40"
                }`}>
                  {status === "GOING_1" ? "Going Once" : status === "GOING_2" ? "Going Twice" : status}
                </span>
                <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-end gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className={`font-bold ${timer <= 3 ? "text-rose-400 animate-ping" : "text-amber-300"}`}>
                    {timer}s left
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Who Made That Bid */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Highest Bidder
                </span>
                {leadingTeam ? (
                  <div className="mt-1">
                    <div className="text-2xl font-black text-white font-teko uppercase flex items-center gap-2">
                      <span className="text-amber-400">{leadingTeam.short_name}</span>
                      <span className="text-slate-300 text-lg font-sans font-semibold">({leadingTeam.name})</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Owner: <strong className="text-slate-200">{leadingTeam.ownerName || "Franchise"}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-400 italic">
                    Waiting for opening paddle raise...
                  </div>
                )}
              </div>

              {leadingTeam && (
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
                  {leadingTeam.logo_text || "🏏"}
                </div>
              )}
            </div>

          </div>

          {/* Center Stage: Circular Ring of 10 Franchises Around Active Player */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            
            <div className="text-center mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Tap any franchise badge to inspect their purse & squad
              </span>
            </div>

            {/* Circular Dial Container */}
            <div className="relative w-full max-w-[480px] h-[480px] mx-auto flex items-center justify-center my-4">
              
              {/* Outer decorative orbit ring */}
              <div className="absolute inset-4 rounded-full border border-slate-800/80 pointer-events-none"></div>
              <div className="absolute inset-16 rounded-full border border-slate-800/40 pointer-events-none"></div>

              {/* 10 Team Badges positioned along the circular perimeter */}
              {dialTeams.map((team, index) => {
                const total = dialTeams.length;
                // Calculate angle: 0 starts at 12 o'clock (-90 deg)
                const angle = (index * (360 / total) - 90) * (Math.PI / 180);
                // Radius in percentage from center (50%)
                const radiusPercent = 38; 
                const x = 50 + radiusPercent * Math.cos(angle);
                const y = 50 + radiusPercent * Math.sin(angle);

                const isHighest = team.id === highestBidderTeamId;
                const isUserTeam = team.id === myTeam?.id;

                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team);
                      setActiveTab("squad");
                    }}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center shadow-xl z-20 cursor-pointer ${
                      isHighest
                        ? "bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black ring-4 ring-amber-400/50 scale-110 shadow-amber-500/40 animate-pulse"
                        : isUserTeam
                        ? "bg-slate-800 text-amber-300 border-2 border-amber-400/60 hover:scale-105"
                        : "bg-[#0e1628] text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:scale-105"
                    }`}
                    title={`Click to view ${team.name} squad & purse`}
                  >
                    <span className="text-base sm:text-lg leading-none">{team.logo_text || "🏏"}</span>
                    <span className="text-[10px] sm:text-xs font-teko font-bold uppercase tracking-wider mt-0.5">
                      {team.short_name}
                    </span>
                    {isHighest && (
                      <span className="absolute -top-2 -right-1 bg-amber-300 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight shadow">
                        BID
                      </span>
                    )}
                  </button>
                );
              })}

              {/* CENTER HUB: Active Player Card on the Block */}
              <div className="relative z-10 w-48 sm:w-56 p-4 rounded-3xl bg-[#0f172a] border-2 border-amber-400/40 shadow-2xl text-center flex flex-col items-center justify-center">
                
                {/* Overseas / Indian pill */}
                <div className="mb-2">
                  {currentPlayer.is_overseas === 1 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      ✈️ Overseas
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      🇮🇳 Indian
                    </span>
                  )}
                </div>

                {/* Player Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/80 flex items-center justify-center text-3xl shadow-inner mb-1.5">
                  👤
                </div>

                {/* Player Name */}
                <h3 className="text-xl sm:text-2xl font-black text-white font-teko tracking-wide uppercase leading-tight line-clamp-1">
                  {currentPlayer.name}
                </h3>

                {/* Playing Role */}
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mt-0.5">
                  {currentPlayer.role}
                </div>

                {/* Country & Base Price */}
                <div className="text-[11px] text-slate-400 mt-1">
                  <span>{currentPlayer.country}</span> • Base: <strong className="text-slate-200">₹{currentPlayer.base_price?.toFixed(2) || "0.30"} Cr</strong>
                </div>

                {/* RTM Tag if applicable */}
                {currentPlayer.former_team_short && (
                  <div className="mt-1.5 text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>RTM: {currentPlayer.former_team_short}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Controls Bar: Paddle & Next Bid */}
            <div className="pt-4 border-t border-slate-800/80 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="text-xs text-slate-300 font-semibold">
                  Your Team: <strong className="text-amber-400">{myTeam ? myTeam.name : "Spectator"}</strong>
                </div>
                {myTeam && (
                  <div className="text-xs text-slate-400 space-x-3">
                    <span>Purse: <strong className="text-amber-300">₹{myPurseRemaining.toFixed(2)} Cr</strong></span>
                    <span>Overseas: <strong className="text-sky-300">{myOverseasCount}/8</strong></span>
                    <span>Squad: <strong className="text-slate-200">{mySquadSize}/25</strong></span>
                  </div>
                )}
              </div>

              {/* Bidding Button */}
              <button
                onClick={() => onPlaceBid(myTeam.id, myTeam.name)}
                disabled={!canBid}
                className={`w-full py-4 px-6 rounded-2xl font-black text-xl sm:text-2xl font-teko tracking-wider uppercase transition flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] ${
                  canBid
                    ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/30 ring-2 ring-amber-400/40 cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                }`}
              >
                <Gavel className="w-6 h-6" />
                <span>
                  {canBid 
                    ? `Raise Bid to ₹${nextBid.toFixed(2)} Cr` 
                    : isLeading 
                    ? `You Hold The Current Bid (₹${currentBid.toFixed(2)} Cr)` 
                    : "Paddle Inactive"}
                </span>
              </button>

              {!canBid && bidErrorReason && !isLeading && (
                <div className="mt-2 text-xs text-center text-rose-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{bidErrorReason}</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT: Interactive Sidebar Tabs (Live Chat & Team Squad Inspector) (4 cols) */}
        <div className="lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col h-[650px]">
          
          {/* Tab Selection Headers */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-4">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                activeTab === "chat"
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Room Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("squad");
                if (!selectedTeam) setSelectedTeam(teams[0]);
              }}
              className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                activeTab === "squad"
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Squad Inspector</span>
            </button>
          </div>

          {/* TAB 1: Real-Time Chat Room */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-amber-400" />
                    <span>No messages yet. Send a message to chat with other franchise owners!</span>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          {msg.teamName && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-mono text-[9px]">
                              {msg.teamName}
                            </span>
                          )}
                          <span>{msg.senderName}</span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-500">{msg.time}</span>
                      </div>
                      <div className="text-slate-200 font-medium break-words">
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message or banter..."
                  maxLength={200}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* TAB 2: Team Squad Inspector */}
          {activeTab === "squad" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Franchise Quick Switcher Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {teams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeam(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-teko uppercase transition shrink-0 ${
                      (selectedTeam?.id || teams[0].id) === t.id
                        ? "bg-amber-400 text-slate-950 shadow"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {t.short_name}
                  </button>
                ))}
              </div>

              {/* Selected Franchise Summary Card */}
              {selectedTeam && (
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl mb-3 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                        {selectedTeam.logo_text || "🏏"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-none">{selectedTeam.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          Owner: <strong className="text-slate-200">{selectedTeam.ownerName || "Unclaimed"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purse & Overseas Counts Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 pt-2 border-t border-slate-800/80">
                    <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Purse Left</span>
                      <strong className="text-amber-400 font-teko text-base">
                        ₹{(selectedTeam.purse?.purse_remaining ?? 125.0).toFixed(2)} Cr
                      </strong>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Overseas</span>
                      <strong className="text-sky-300 font-teko text-base">
                        {selectedTeam.overseasCount || 0} / 8
                      </strong>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Squad</span>
                      <strong className="text-slate-200 font-teko text-base">
                        {selectedTeam.squadSize || selectedTeam.squad?.length || 0} / 25
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Player List Taken by this Team */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                  Players Signed by {(selectedTeam || teams[0]).short_name} ({((selectedTeam || teams[0]).squad || []).length})
                </div>

                {((selectedTeam || teams[0]).squad || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No players signed in this squad yet.
                  </div>
                ) : (
                  ((selectedTeam || teams[0]).squad || []).map((player, idx) => (
                    <div
                      key={player.id || idx}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 truncate flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.is_overseas === 1 && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              ✈️
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {player.role} • {player.country}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-teko font-bold text-sm text-emerald-400">
                          ₹{player.price ? player.price.toFixed(2) : "0.30"} Cr
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase">
                          {player.orig_acq || "Acquired"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* RTM Decision Modal for Former Team */}
      {isMyRTM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0f172a] border-2 border-purple-500 rounded-3xl p-6 shadow-2xl text-center">
            <div className="inline-flex p-3 rounded-full bg-purple-500/20 text-purple-400 mb-3">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-2xl font-black text-white font-teko tracking-wide uppercase">
              Right to Match (RTM) Triggered!
            </h3>

            <p className="text-xs text-slate-300 mt-1">
              {currentPlayer.name} was on your 2026 roster. Do you want to match the winning bid of 
              <strong className="text-amber-400 text-sm"> ₹{currentBid.toFixed(2)} Cr</strong>?
            </p>

            <div className="my-4 text-3xl font-mono font-bold text-purple-400 animate-pulse">
              {rtmTimer}s remaining
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onExerciseRTM(myTeam.id, myTeam.name)}
                className="py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs uppercase shadow-lg shadow-purple-500/30 transition"
              >
                Match Bid & Sign
              </button>
              <button
                onClick={() => onDeclineRTM(myTeam.id)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase transition"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
