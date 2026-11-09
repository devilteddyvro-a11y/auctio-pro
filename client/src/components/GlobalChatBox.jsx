import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, ChevronDown, Users, Sparkles } from "lucide-react";

export function GlobalChatBox({
  chatMessages = [],
  onSendChat,
  userName = "Owner",
  myTeam = null,
  participants = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const prevCountRef = useRef(chatMessages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    } else if (chatMessages.length > prevCountRef.current) {
      setUnreadCount(prev => prev + (chatMessages.length - prevCountRef.current));
    }
    prevCountRef.current = chatMessages.length;
  }, [chatMessages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendChat(inputText);
    setInputText("");
  };

  return (
    <aside aria-label="Franchise Chat" className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen ? (
        /* Minimized Floating Button */
        <button
          onClick={handleOpen}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-300/40"
          title="Open live franchise chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <span className="text-xs uppercase tracking-wider font-extrabold font-teko text-base pt-0.5">
            Franchise Chat
          </span>

          {/* Unread Pill Badge */}
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-bounce shadow">
              {unreadCount}
            </span>
          )}

          {/* Participant count indicator */}
          <span className="hidden sm:inline-flex text-[11px] text-slate-900/80 font-mono pl-1">
            ({participants.length} 👥)
          </span>
        </button>
      ) : (
        /* Expanded Chat Box Window */
        <div className="w-[340px] sm:w-[380px] h-[460px] max-h-[85vh] flex flex-col bg-[#0b101e]/95 border-2 border-amber-400/30 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Franchise Chat</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {participants.length} Owners Online • All Stages
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
              title="Minimize chat"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                <Sparkles className="w-7 h-7 mb-2 text-amber-400/40 animate-pulse" />
                <span className="font-semibold text-slate-400">Franchise Chat is Open!</span>
                <span className="text-[11px] mt-1 text-slate-500 max-w-[220px]">
                  Negotiate trades, discuss retentions, and banter live during the auction.
                </span>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.senderName === userName;

                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-2xl border transition ${
                      isMe
                        ? "bg-amber-500/10 border-amber-500/30 ml-4"
                        : "bg-slate-900/90 border-slate-800 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {msg.teamName && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono text-[9px] uppercase">
                            {msg.teamName}
                          </span>
                        )}
                        <span className={isMe ? "text-amber-300" : "text-slate-200"}>
                          {msg.senderName} {isMe ? "(You)" : ""}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <div className="text-slate-100 font-medium break-words leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#0a0f1d] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={myTeam ? `Chat as ${myTeam.short_name}...` : "Send message to room..."}
              maxLength={250}
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 font-bold transition shadow"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </aside>
  );
}
