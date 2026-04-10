import React from "react";
import { FiMic, FiUser } from "react-icons/fi";

const GDParticipantGrid = ({
  initAgents,
  AGENT_COLORS,
  speakingAgent,
  isThinking,
  AGENT_IMAGES,
  user,
  isUserSpeaking,
  openedRef,
  isConcludingPhase,
  isMuted,
  sessionEnded,
}) => {
  const AgentTile = ({ agent }) => {
    const on = speakingAgent === agent.name;
    const color = agent.color || AGENT_COLORS[agent.name] || "#6366f1";
    return (
      <div
        className={`relative flex flex-col items-center gap-2 p-5 rounded-3xl border transition-all duration-500 overflow-hidden backdrop-blur-xl ${
          on
            ? "scale-[1.05] z-10"
            : "hover:brightness-110"
        }`}
        style={
          on 
            ? { 
                backgroundColor: `${color}22`,
                borderColor: `${color}88`, 
                boxShadow: `0 0 40px ${color}33`, 
                outline: `1px solid ${color}44` 
              } 
            : {
                backgroundColor: `${color}11`,
                borderColor: `${color}22`
              }
        }
      >
        {on && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-end justify-center gap-[2px] px-4 pb-2 opacity-50">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-white/60 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 80}%`,
                  animationDuration: `${0.4 + Math.random() * 0.6}s`,
                  background: color,
                }}
              />
            ))}
          </div>
        )}

        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center font-black text-white z-10 text-xl transition-all duration-500 overflow-hidden shadow-lg"
          style={{
            background: on ? `${color}44` : `${color}11`,
            border: `3px solid ${ color }`,
            boxShadow: on ? `0 0 40px ${color}88` : "none",
            transform: on ? "translateY(-5px)" : "none",
          }}
        >
          {AGENT_IMAGES[agent.name] ? (
            <img
              src={AGENT_IMAGES[agent.name]}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          ) : (
            agent.name[0]
          )}
          {/* {on && (
            <div
              className="absolute  -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 flex items-center justify-center shadow-lg"
              style={{ background: color }}
            >
              <FiMic size={10} className="text-white" />
            </div>
          )} */}
        </div>

        <div className="text-center z-10 mt-1">
          <p className="text-xs font-bold text-white tracking-wide drop-shadow-md">
            {agent.name}
          </p>
          <div className="h-4 flex items-center justify-center">
            {on ? (
              <span
               
                className="text-[10px] font-black"
              >
                Speaking...
              </span>
            ) : isThinking ? (
              <div className="flex gap-1">
                <div
                  className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            ) : (
              <span className="text-zinc-500 text-[10px]   ">
                Thinking...
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const UserTile = () => {
    const isFloorOpen = !speakingAgent && !isMuted && !sessionEnded;

    return (
      <div
        className={`relative flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
          isUserSpeaking
            ? "border-emerald-500/50 bg-zinc-800/90 scale-[1.03] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            : isFloorOpen
              ? "border-[#bef264]/40 bg-zinc-900/80 ring-2 ring-[#bef264]/20 shadow-lg"
              : "border-white/5 bg-zinc-900/60 hover:bg-zinc-800/60"
        }`}
      >
        {isUserSpeaking && (
          <div className="absolute inset-0 rounded-3xl animate-pulse opacity-15 bg-emerald-500" />
        )}
        {isFloorOpen && !isUserSpeaking && (
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl text-black text-[10px] font-black uppercase tracking-widest animate-bounce shadow-xl z-20 ${
              !openedRef
                ? "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                : isConcludingPhase
                  ? "bg-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.4)]"
                  : "bg-[#bef264] shadow-[0_0_20px_rgba(190,242,100,0.4)]"
            }`}
          >
            {!openedRef
              ? "Initiate!"
              : isConcludingPhase
                ? "Conclude!"
                : "Give Opinion!"}
            <div
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
                !openedRef
                  ? "bg-emerald-400"
                  : isConcludingPhase
                    ? "bg-orange-400"
                    : "bg-[#bef264]"
              }`}
            />
          </div>
        )}
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow-md"
          style={{
            background: isFloorOpen ? `${AGENT_COLORS.Marcus}22` : "#22c55e22",
            border: `2px solid ${isUserSpeaking ? "#22c55e" : isFloorOpen ? (!openedRef ? "#10b981" : isConcludingPhase ? "#f97316" : "var(--[#bef264])") : "#22c55e44"}`,
            boxShadow: isUserSpeaking
              ? "0 0 20px #22c55e66"
              : isFloorOpen
                ? isConcludingPhase
                  ? "0 0 25px rgba(249,115,22,0.4)"
                  : "0 0 20px rgba(190,242,100,0.3)"
                : "none",
          }}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="You"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <FiUser className="text-emerald-400" size={20} />
          )}
          {isUserSpeaking && (
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-zinc-900 bg-emerald-400 flex items-center justify-center shadow-lg">
              <FiMic size={8} className="text-zinc-900" />
            </div>
          )}
        </div>
        <div className="text-center z-10">
          <p className="text-xs font-bold text-zinc-200 drop-shadow-md">You</p>
          <p className="text-[10px]">
            {isMuted ? (
              <span className="text-red-400 font-semibold drop-shadow-sm">Muted</span>
            ) : isUserSpeaking ? (
              <span className="text-emerald-400 font-bold animate-pulse drop-shadow-sm">
                Speaking...
              </span>
            ) : isFloorOpen ? (
              <span
                className={`font-black animate-pulse uppercase tracking-tighter drop-shadow-sm ${
                  !openedRef
                    ? "text-emerald-400"
                    : isConcludingPhase
                      ? "text-orange-400"
                      : "text-[#bef264]"
                }`}
              >
                {!openedRef
                  ? "Init GD"
                  : isConcludingPhase
                    ? "Wrap Up"
                    : "Open Floor"}
              </span>
            ) : (
              <span className="text-zinc-500 font-semibold">Ready</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative aspect-video bg-zinc-950/80 rounded-[32px] overflow-hidden border border-[#bef264]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 backdrop-blur-xl group">
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#bef264]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full relative z-10">
        {initAgents.map((a) => (
          <AgentTile key={a.name} agent={a} />
        ))}
        <UserTile />
      </div>
    </div>
  );
};

export default GDParticipantGrid;
