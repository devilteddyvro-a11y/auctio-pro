import React, { useState, useEffect } from "react";
import { socket, getOrCreateSessionId, getSavedUserName, saveUserName } from "./utils/socket";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { Lobby } from "./components/Lobby";
import { TradeWindow } from "./components/TradeWindow";
import { RetentionStage } from "./components/RetentionStage";
import { LiveAuctionFloor } from "./components/LiveAuctionFloor";
import { SquadTransparencyModal } from "./components/SquadTransparencyModal";
import { GlobalChatBox } from "./components/GlobalChatBox";
import { FinalLineupBoard } from "./components/FinalLineupBoard";

const SERVER_URL = window.location.hostname === "localhost" ? "http://localhost:4000" : `http://${window.location.hostname}:4000`;

export default function App() {
  const [sessionId] = useState(getOrCreateSessionId);
  const [userName, setUserName] = useState(getSavedUserName);
  const [roomData, setRoomData] = useState(null);
  const [liveAuction, setLiveAuction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [squadModalOpen, setSquadModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Parse room code from invite URL query string ?room=XYZ
  const [defaultRoomCode, setDefaultRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "";
  });

  // Reconnect check on mount
  useEffect(() => {
    const savedRoomId = localStorage.getItem("ipl_auction_room_id");
    if (savedRoomId) {
      fetch(`/api/rooms/${savedRoomId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.room && data.room.phase !== "ENDED") {
            setRoomData(data);
            socket.emit("JOIN_ROOM", { roomId: data.room.id, sessionId });
          } else {
            localStorage.removeItem("ipl_auction_room_id");
          }
        })
        .catch(() => {
          localStorage.removeItem("ipl_auction_room_id");
        });
    }
  }, [sessionId]);

  // Socket Event Listeners
  useEffect(() => {
    socket.on("ROOM_STATE_UPDATED", (state) => {
      setRoomData(state);
      if (state.liveAuction) {
        setLiveAuction(state.liveAuction);
      }
    });

    socket.on("AUCTION_TICK", (auctionState) => {
      setLiveAuction(auctionState);
    });

    socket.on("ACTION_ERROR", (err) => {
      alert(err);
    });

    socket.on("CHAT_MESSAGE", (msg) => {
      setChatMessages(prev => [...prev.slice(-49), msg]);
    });

    socket.on("ROOM_ABANDONED", () => {
      localStorage.removeItem("ipl_auction_room_id");
      setRoomData(null);
      setLiveAuction(null);
      alert("The room admin has abandoned and ended the auction.");
      window.history.replaceState({}, document.title, window.location.pathname);
    });

    return () => {
      socket.off("ROOM_STATE_UPDATED");
      socket.off("AUCTION_TICK");
      socket.off("ACTION_ERROR");
      socket.off("CHAT_MESSAGE");
      socket.off("ROOM_ABANDONED");
    };
  }, []);

  // Guarantee socket re-joins room immediately upon any connect / reconnect event
  useEffect(() => {
    const handleConnect = () => {
      const activeRoomId = roomData?.room?.id || localStorage.getItem("ipl_auction_room_id");
      if (activeRoomId) {
        socket.emit("JOIN_ROOM", { roomId: activeRoomId, sessionId });
      }
    };

    socket.on("connect", handleConnect);
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [sessionId, roomData?.room?.id]);

  // Background safety sync (every 2.5s) so page updates even without manual refresh
  useEffect(() => {
    const activeRoomId = roomData?.room?.id || localStorage.getItem("ipl_auction_room_id");
    if (!activeRoomId) return;

    const interval = setInterval(() => {
      fetch(`/api/rooms/${activeRoomId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.room && data.room.phase !== "ENDED") {
            setRoomData(prev => {
              if (!prev) return data;
              // Detect phase change, participant count change, or claim change
              const phaseChanged = prev.room.phase !== data.room.phase;
              const participantsChanged = prev.participants.length !== data.participants.length;
              const claimsChanged = prev.teams.some((t, i) => t.claimed !== data.teams[i]?.claimed);
              const retentionsChanged = prev.teams.some((t, i) => t.retentionConfirmed !== data.teams[i]?.retentionConfirmed);

              if (phaseChanged || participantsChanged || claimsChanged || retentionsChanged) {
                return data;
              }
              return prev;
            });

            // Also keep liveAuction unstuck if in AUCTION phase
            if (data.room.phase === "AUCTION" && data.liveAuction) {
              setLiveAuction(prev => {
                // If auction tick was missed (e.g. socket reconnected), catch up to server
                if (!prev || prev.currentPlayer?.id !== data.liveAuction.currentPlayer?.id || Math.abs(prev.timer - data.liveAuction.timer) > 1 || prev.status !== data.liveAuction.status) {
                  return data.liveAuction;
                }
                return prev;
              });
            }
          }
        })
        .catch(() => {});
    }, 2500);

    return () => clearInterval(interval);
  }, [roomData?.room?.id]);

  // Handlers
  const handleCreateRoom = async (name) => {
    setLoading(true);
    setErrorMessage("");
    saveUserName(name);
    setUserName(name);

    try {
      const res = await fetch(`/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name, sessionId })
      });
      const data = await res.json();
      if (data.roomId) {
        localStorage.setItem("ipl_auction_room_id", data.roomId);
        // Fetch full state
        const stateRes = await fetch(`/api/rooms/${data.roomId}`);
        const stateData = await stateRes.json();
        setRoomData(stateData);
        socket.emit("JOIN_ROOM", { roomId: data.roomId, sessionId });
      }
    } catch (err) {
      setErrorMessage("Failed to connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (code, name) => {
    setLoading(true);
    setErrorMessage("");
    saveUserName(name);
    setUserName(name);

    try {
      const res = await fetch(`/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: code, userName: name, sessionId })
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Failed to join room.");
        setLoading(false);
        return;
      }
      localStorage.setItem("ipl_auction_room_id", data.roomId);
      const stateRes = await fetch(`/api/rooms/${data.roomId}`);
      const stateData = await stateRes.json();
      setRoomData(stateData);
      socket.emit("JOIN_ROOM", { roomId: data.roomId, sessionId });
    } catch (err) {
      setErrorMessage("Could not reach room. Check room code or server.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTeam = (teamId) => {
    if (!roomData) return;
    socket.emit("CLAIM_TEAM", { roomId: roomData.room.id, sessionId, teamId });
  };

  const handleStartTrading = () => {
    if (!roomData) return;
    socket.emit("START_TRADING", { roomId: roomData.room.id });
  };

  const handleProposeTrade = (tradeData) => {
    if (!roomData) return;
    socket.emit("PROPOSE_TRADE", { roomId: roomData.room.id, sessionId, tradeData });
  };

  const handleRespondTrade = (tradeId, accept) => {
    if (!roomData) return;
    socket.emit("RESPOND_TRADE", { roomId: roomData.room.id, sessionId, tradeId, accept });
  };

  const handleEndTrading = () => {
    if (!roomData) return;
    socket.emit("ADVANCE_TO_RETENTION", { roomId: roomData.room.id, sessionId });
  };

  const handleSubmitRetention = (data) => {
    if (!roomData) return;
    socket.emit("SUBMIT_RETENTION", { roomId: roomData.room.id, sessionId, data });
  };

  const handleStartAuction = () => {
    if (!roomData) return;
    socket.emit("FINALIZE_RETENTION_START_AUCTION", { roomId: roomData.room.id, sessionId });
  };

  const handlePlaceBid = (teamId, teamName) => {
    if (!roomData) return;
    socket.emit("PLACE_BID", { roomId: roomData.room.id, teamId, teamName });
  };

  const handleExerciseRTM = (teamId, teamName) => {
    if (!roomData) return;
    socket.emit("EXERCISE_RTM", { roomId: roomData.room.id, teamId, teamName });
  };

  const handleDeclineRTM = (teamId) => {
    if (!roomData) return;
    socket.emit("DECLINE_RTM", { roomId: roomData.room.id, teamId });
  };

  const handleResumeAuction = () => {
    if (!roomData) return;
    socket.emit("RESUME_AUCTION", { roomId: roomData.room.id });
  };

  const handleSendChat = (text) => {
    if (!roomData || !text.trim()) return;
    socket.emit("SEND_CHAT", {
      roomId: roomData.room.id,
      senderName: userName || "Owner",
      teamName: myTeam?.short_name || null,
      text
    });
  };

  const handleAbandonRoom = () => {
    if (!roomData) return;
    socket.emit("ABANDON_ROOM", { roomId: roomData.room.id, sessionId });
  };

  const handleVoteEndBidding = (vote) => {
    if (!roomData) return;
    socket.emit("VOTE_END_BIDDING", { roomId: roomData.room.id, sessionId, vote });
  };

  const handleSubmitLineup = (lineupData) => {
    if (!roomData) return;
    socket.emit("SUBMIT_LINEUP", { roomId: roomData.room.id, sessionId, ...lineupData });
  };

  // Find user's claimed team
  const myParticipant = roomData?.participants?.find(p => p.session_id === sessionId);
  const myTeam = roomData?.teams?.find(t => t.id === myParticipant?.team_id);

  if (!roomData) {
    return (
      <LandingPage
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
        defaultRoomCode={defaultRoomCode}
      />
    );
  }

  const phase = roomData.room.phase;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <Header
        room={roomData.room}
        participants={roomData.participants}
        mySessionId={sessionId}
        myTeam={myTeam}
        onOpenSquadModal={() => setSquadModalOpen(true)}
        onAbandonRoom={handleAbandonRoom}
      />

      <main className="flex-1">
        {phase === "LOBBY" && (
          <Lobby
            room={roomData.room}
            teams={roomData.teams}
            participants={roomData.participants}
            mySessionId={sessionId}
            onClaimTeam={handleClaimTeam}
            onStartTrading={handleStartTrading}
            onAdvanceToRetention={handleEndTrading}
          />
        )}

        {phase === "TRADING" && (
          <TradeWindow
            room={roomData.room}
            teams={roomData.teams}
            participants={roomData.participants}
            trades={roomData.trades || []}
            mySessionId={sessionId}
            onProposeTrade={handleProposeTrade}
            onRespondTrade={handleRespondTrade}
            onEndTrading={handleEndTrading}
          />
        )}

        {phase === "RETENTION" && (
          <RetentionStage
            room={roomData.room}
            teams={roomData.teams}
            participants={roomData.participants}
            mySessionId={sessionId}
            onSubmitRetention={handleSubmitRetention}
            onStartAuction={handleStartAuction}
          />
        )}

        {phase === "AUCTION" && (
          <LiveAuctionFloor
            room={roomData.room}
            teams={roomData.teams}
            liveAuction={liveAuction || roomData.liveAuction}
            endBiddingVotes={roomData.endBiddingVotes}
            mySessionId={sessionId}
            userName={userName}
            chatMessages={chatMessages}
            onSendChat={handleSendChat}
            onPlaceBid={handlePlaceBid}
            onVoteEndBidding={handleVoteEndBidding}
            onExerciseRTM={handleExerciseRTM}
            onDeclineRTM={handleDeclineRTM}
            onResumeAuction={handleResumeAuction}
          />
        )}

        {(phase === "COMPLETED" || phase === "LINEUP" || phase === "FINAL_SQUAD") && (
          <FinalLineupBoard
            room={roomData.room}
            teams={roomData.teams}
            mySessionId={sessionId}
            onSubmitLineup={handleSubmitLineup}
          />
        )}
      </main>

      <SquadTransparencyModal
        isOpen={squadModalOpen}
        onClose={() => setSquadModalOpen(false)}
        teams={roomData.teams}
        myTeamId={myTeam?.id}
      />

      {/* Universal Franchise Chat across all stages: Lobby, Trading, Retention, and Auction */}
      <GlobalChatBox
        chatMessages={chatMessages}
        onSendChat={handleSendChat}
        userName={userName}
        myTeam={myTeam}
        participants={roomData.participants}
      />
    </div>
  );
}

