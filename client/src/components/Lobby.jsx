import React, { useState } from "react";
import { Users, Copy, Check, ArrowRight, ShieldCheck, Play, Globe, Wifi } from "lucide-react";

export function Lobby({ room, teams, participants, mySessionId, onClaimTeam, onStartTrading }) {
  const [copiedType, setCopiedType] = useState(null);
  const isHost = participants.find(p => p.session_id === mySessionId)?.is_host === 1;
  const myParticipant = participants.find(p => p.session_id === mySessionId);
  const myTeamId = myParticipant?.team_id;
  const claimedCount = teams.filter(t => t.claimed).length;

  // Detect current site origin automatically (works for Render, Cloud, Local, or Custom Domain)
  const currentOrigin = window.location.origin;
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  // Direct share link using the actual live website domain
  const shareUrl = `${currentOrigin}/?room=${room.room_code}`;
  
  // Local Wi-Fi IP link (only applicable if running on a local home PC)
  const wifiUrl = `http://192.168.1.5:4000/?room=${room.room_code}`;

  const copyLink = (url, type) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Lobby Welcome Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold mb-3">
              <span>🏏</span> First-Come-First-Served Selection
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-teko tracking-wide uppercase">
              Choose Your IPL Franchise
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Each participant must claim exactly one team. Once claimed, that team is locked to you. 
              All teams start with their official 2026 player lists and ₹125 Cr purse.
            </p>
          </div>

          {/* Status Indicator & Host Trigger */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl">
              <Users className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Franchises Claimed</div>
                <div className="text-lg font-bold text-white font-teko">
                  <span className="text-amber-400">{claimedCount}</span> / 10
                </div>
              </div>
            </div>

            {isHost && (
              <button
                onClick={onStartTrading}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Trading Window {claimedCount < 10 ? "(Test Mode)" : ""}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shareable Invite Link Card */}
      <div className="mb-8">
        {!isLocalhost ? (
          /* Hosted on Internet (Render / Cloud / Custom Domain) - Clean single share box */
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-400/30 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Globe className="w-4 h-4" />
                <span>Shareable Room Invite Link (Copy & Send to Friends)</span>
              </div>
              <div className="text-sm font-mono text-slate-100 break-all bg-slate-900/90 p-3 rounded-xl border border-slate-700 select-all">
                {shareUrl}
              </div>
            </div>
            <button
              onClick={() => copyLink(shareUrl, "share")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-amber-500/20 shrink-0 uppercase tracking-wider font-teko text-base"
            >
              {copiedType === "share" ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === "share" ? "Copied Invite Link!" : "Copy Invite Link"}</span>
            </button>
          </div>
        ) : (
          /* Local Testing on PC */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex flex-col justify-between gap-3 shadow">
              <div>
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wide mb-1">
                  <Wifi className="w-4 h-4" />
                  <span>Option 1: Friends on the SAME Wi-Fi</span>
                </div>
                <div className="text-xs font-mono text-slate-300 break-all bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  {wifiUrl}
                </div>
              </div>
              <button
                onClick={() => copyLink(wifiUrl, "wifi")}
                className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
              >
                {copiedType === "wifi" ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === "wifi" ? "Copied Wi-Fi Link!" : "Copy Same-Wi-Fi Link"}</span>
              </button>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col justify-between gap-3 shadow">
              <div>
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wide mb-1">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Option 2: Direct Active Link</span>
                </div>
                <div className="text-xs font-mono text-slate-300 break-all bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  {shareUrl}
                </div>
              </div>
              <button
                onClick={() => copyLink(shareUrl, "share")}
                className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
              >
                {copiedType === "share" ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === "share" ? "Copied Link!" : "Copy Direct Link"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 10 Franchise Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {teams.map(team => {
          const isMyTeam = team.id === myTeamId;
          const isClaimedByOther = team.claimed && !isMyTeam;

          return (
            <div
              key={team.id}
              className={`relative rounded-2xl p-5 border transition flex flex-col justify-between overflow-hidden shadow-lg ${
                isMyTeam
                  ? "bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30"
                  : isClaimedByOther
                  ? "bg-slate-900/40 border-slate-800/80 opacity-75"
                  : "bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:scale-[1.02]"
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl shadow-inner">
                    {team.logo_text}
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {team.short_name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug">{team.name}</h3>
                
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>2026 Squad:</span>
                    <span className="font-semibold text-slate-300">{team.squadSize || 25} players</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purse Base:</span>
                    <span className="font-semibold text-amber-300">₹125.00 Cr</span>
                  </div>
                </div>
              </div>

              {/* Status / Claim Button */}
              <div className="mt-5 pt-3 border-t border-slate-800/80">
                {isMyTeam ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Your Team</span>
                  </div>
                ) : isClaimedByOther ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium text-center truncate">
                    Claimed by: <span className="text-slate-200 font-semibold">{team.ownerName}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onClaimTeam(team.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Claim {team.short_name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
