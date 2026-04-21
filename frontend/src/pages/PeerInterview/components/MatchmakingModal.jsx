import React from "react";
import { FiUser, FiXCircle } from "react-icons/fi";

const MatchmakingModal = ({
  show,
  matchModalStatus,
  activeRouletteAvatar,
  preferences,
  leaveQueue,
  currentUser,
  matchedUser,
  startInterviewCountdown,
  matchedSessionId,
  navigate,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center space-y-12 animate-modal-in">
        {matchModalStatus === "searching" ? (
          <div className="space-y-12">
            <div className="relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#bef264]/5 blur-[80px] rounded-full animate-pulse" />
              <div className="flex items-center gap-6 overflow-hidden py-4">
                <div className="shrink-0 w-32 h-32 rounded-3xl border-2 border-[#bef264] p-1 glass-panel flex items-center justify-center relative overflow-hidden">
                  {activeRouletteAvatar ? (
                    <img
                      key={activeRouletteAvatar}
                      src={activeRouletteAvatar}
                      alt="Roulette"
                      className="w-full h-full object-cover rounded-2xl roulette-item"
                    />
                  ) : (
                    <FiUser size={48} className="text-zinc-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#bef264]/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black mb-4">
                Finding Your Perfect Peer
              </h2>
              <p className="text-zinc-400 max-w-md mx-auto">
                We're analyzing candidates to find the best match for your role
                in{" "}
                <span className="text-[#bef264] font-bold">
                  {preferences.targetRole || "Tech"}
                </span>
                .
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-12 rounded-full bg-[#bef264] animate-pulse" />
                <span className="h-2 w-8 rounded-full bg-white/20" />
                <span className="h-2 w-4 rounded-full bg-white/10" />
              </div>

              <button
                onClick={leaveQueue}
                className="group flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-500 transition-all duration-300"
              >
                <FiXCircle className="group-hover:rotate-90 transition-transform" />
                Cancel Matchmaking
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12 py-8">
            <div className="relative flex items-center justify-center gap-8 md:gap-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#bef264] p-1 shadow-[0_0_30px_rgba(190,242,100,0.3)]">
                  <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {currentUser?.imageUrl ? (
                      <img
                        src={currentUser.imageUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser size={48} className="text-zinc-600" />
                    )}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-widest text-[#bef264] font-black">
                  You
                </span>
              </div>

              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#bef264] flex items-center justify-center text-black font-black italic text-xl shadow-[0_0_50px_rgba(190,242,100,0.5)]">
                  VS
                </div>
                <div className="absolute inset-0 -z-10 animate-ping opacity-30 bg-[#bef264] rounded-full" />
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-indigo-500 p-1 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {matchedUser?.avatar ? (
                      <img
                        src={matchedUser.avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser size={48} className="text-zinc-600" />
                    )}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-black">
                  Peer Found
                </span>
              </div>
            </div>

            <div className="animate-fade-in [animation-delay:0.3s]">
              <h2 className="text-4xl font-black mb-2">Match Confirmed!</h2>
              <p className="text-xl text-zinc-400">
                You're interviewing with{" "}
                <span className="text-white font-bold">
                  {matchedUser?.firstName || "a compatible peer"}
                </span>
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-[#bef264] font-black text-2xl tabular-nums">
                  {startInterviewCountdown}
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-[0.2em]">
                  Seconds to launch
                </span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() =>
                  navigate(`/peer-interview/session/${matchedSessionId}`)
                }
                className="px-10 py-4 rounded-2xl bg-[#bef264] text-black font-black text-lg hover:scale-105 transition active:scale-95 shadow-xl shadow-[#bef264]/20"
              >
                JOIN NOW
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchmakingModal;
