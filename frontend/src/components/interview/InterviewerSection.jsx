// import React, { useEffect, useRef, useState } from "react";
// import { FiUser, FiVideo } from "react-icons/fi";

// const InterviewerSection = ({
//   activeCodingTask,
//   hasCallEnded,
//   isAgentSpeaking,
//   isAiThinking,
//   isUserSpeaking,
//   isUserFocus,
//   isVideoOn,
//   callStatus,
//   connectionStatus,
//   transcriptCount,
//   userAvatar,
//   agentName,
//   getAgentImage,
//   getAgentVideo,
//   agentVisualState,
//   enableLoopedVideoAvatar,
//   localVideoRef,
//   agentVolumeCircleRef,
//   toggleVideoFocus,
// }) => {
//   const failedVideoSourcesRef = useRef(new Set());
//   const transitionTimerRef = useRef(null);
//   const [frontVideoSrc, setFrontVideoSrc] = useState("");
//   const [backVideoSrc, setBackVideoSrc] = useState("");
//   const [isBackVideoVisible, setIsBackVideoVisible] = useState(false);

//   const isConnecting =
//     connectionStatus !== "Connected" ||
//     callStatus === "loading" ||
//     callStatus === "connecting";

//   const isWaitingToStart = !isConnecting && transcriptCount === 0;
//   const currentVideoSrc =
//     enableLoopedVideoAvatar && getAgentVideo
//       ? getAgentVideo(agentName, agentVisualState)
//       : "";
//   const canRenderLoopedVideo =
//     Boolean(currentVideoSrc) &&
//     !failedVideoSourcesRef.current.has(currentVideoSrc);

//   const avatarObjectPosition = "50% 28%";

//   useEffect(() => {
//     if (!canRenderLoopedVideo) {
//       setFrontVideoSrc("");
//       setBackVideoSrc("");
//       setIsBackVideoVisible(false);
//       return;
//     }

//     if (!frontVideoSrc) {
//       setFrontVideoSrc(currentVideoSrc);
//       return;
//     }

//     if (frontVideoSrc === currentVideoSrc || backVideoSrc === currentVideoSrc) {
//       return;
//     }

//     setBackVideoSrc(currentVideoSrc);
//     setIsBackVideoVisible(false);
//   }, [canRenderLoopedVideo, currentVideoSrc, frontVideoSrc, backVideoSrc]);

//   useEffect(
//     () => () => {
//       if (transitionTimerRef.current) {
//         clearTimeout(transitionTimerRef.current);
//       }
//     },
//     [],
//   );

//   const finalizeCrossfade = () => {
//     if (!backVideoSrc) return;

//     setIsBackVideoVisible(true);
//     if (transitionTimerRef.current) {
//       clearTimeout(transitionTimerRef.current);
//     }

//     transitionTimerRef.current = setTimeout(() => {
//       setFrontVideoSrc(backVideoSrc);
//       setBackVideoSrc("");
//       setIsBackVideoVisible(false);
//     }, 260);
//   };

//   const handleAvatarVideoError = (src) => {
//     if (!src) return;
//     failedVideoSourcesRef.current.add(src);

//     if (src === frontVideoSrc) {
//       setFrontVideoSrc("");
//     }

//     if (src === backVideoSrc) {
//       setBackVideoSrc("");
//       setIsBackVideoVisible(false);
//     }
//   };

//   return (
//     <div
//       className={`relative aspect-video bg-zinc-900/40 rounded-[28px] overflow-hidden border border-white/5 transition-all duration-700 ${activeCodingTask ? "scale-95 blur-xl" : "scale-100 blur-0 shadow-[0_0_50px_rgba(0,0,0,0.3)]"}`}
//     >
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(190,242,100,0.14),transparent_45%),radial-gradient(circle_at_78%_20%,rgba(59,130,246,0.14),transparent_48%),linear-gradient(to_bottom,rgba(9,9,11,0.2),rgba(9,9,11,0.9))]" />

//       <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
//         {!activeCodingTask && !hasCallEnded && (
//           <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse-slow pointer-events-none" />
//         )}

//         {/* Interviewer View / Speaker Indicator */}
//         <div
//           className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${activeCodingTask ? "scale-75" : "scale-100"}`}
//         >
//           {!isUserFocus && (
//             <div
//               className="absolute inset-0 opacity-75"
//               style={{
//                 backgroundImage: "url('/assets/background/Agent-bg.png')",
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//               }}
//             />
//           )}

//           {!isUserFocus && (
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/55" />
//           )}

//           {!isUserFocus && (
//             <>
//               {canRenderLoopedVideo ? (
//                 <>
//                   {frontVideoSrc && (
//                     <video
//                       src={frontVideoSrc}
//                       autoPlay
//                       loop
//                       playsInline
//                       muted
//                       preload="auto"
//                       onError={() => handleAvatarVideoError(frontVideoSrc)}
//                       className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 scale-100 ${isBackVideoVisible ? "opacity-0" : "opacity-100"}`}
//                       style={{ objectPosition: avatarObjectPosition }}
//                     />
//                   )}

//                   {backVideoSrc && (
//                     <video
//                       src={backVideoSrc}
//                       autoPlay
//                       loop
//                       playsInline
//                       muted
//                       preload="auto"
//                       onCanPlay={finalizeCrossfade}
//                       onError={() => handleAvatarVideoError(backVideoSrc)}
//                       className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 scale-100 ${isBackVideoVisible ? "opacity-100" : "opacity-0"}`}
//                       style={{ objectPosition: avatarObjectPosition }}
//                     />
//                   )}
//                 </>
//               ) : (
//                 <img
//                   src={getAgentImage(agentName)}
//                   alt={agentName}
//                   className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 scale-100"
//                   style={{ objectPosition: avatarObjectPosition }}
//                 />
//               )}

//               <div
//                 ref={agentVolumeCircleRef}
//                 className="absolute inset-0 pointer-events-none"
//               />

//               <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/35 to-black/45" />
//             </>
//           )}

//           {!isUserFocus && isConnecting && (
//             <div className="absolute left-4 right-4 bottom-4 z-20 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-3 sm:p-4">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-primary">
//                     Connecting Session
//                   </p>
//                   <p className="text-[11px] sm:text-xs text-zinc-300 mt-1">
//                     Initializing voice engine and live transcript...
//                   </p>
//                 </div>
//                 <div className="h-8 w-8 rounded-full border border-primary/30 border-t-primary animate-spin" />
//               </div>
//             </div>
//           )}

//           {!isUserFocus && isWaitingToStart && (
//             <div className="absolute left-4 right-4 bottom-4 z-20 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-3 sm:p-4">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
//                 <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2.5">
//                   <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary mb-1">
//                     Interview Tip
//                   </p>
//                   <p className="text-[11px] text-zinc-200 leading-relaxed">
//                     Keep answers structured: context, action, and impact.
//                   </p>
//                 </div>
//                 <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2.5">
//                   <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-300 mb-1">
//                     Audio Check
//                   </p>
//                   <p className="text-[11px] text-zinc-200 leading-relaxed">
//                     Speak naturally. Pause briefly after each answer.
//                   </p>
//                 </div>
//                 <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2.5">
//                   <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300 mb-1">
//                     Camera Framing
//                   </p>
//                   <p className="text-[11px] text-zinc-200 leading-relaxed">
//                     Keep your face centered for better feedback quality.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {isUserFocus && isVideoOn && (
//             <div className="w-full h-full p-2">
//               <video
//                 ref={localVideoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/5"
//               />
//             </div>
//           )}

//           {isUserFocus && !isVideoOn && (
//             <div className="absolute inset-0 p-4 sm:p-6 z-10">
//               <div className="h-full w-full rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
//                 {userAvatar ? (
//                   <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-white/10 overflow-hidden mb-3">
//                     <img
//                       src={userAvatar}
//                       alt="You"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ) : (
//                   <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mb-3">
//                     <FiVideo className="text-zinc-300" size={24} />
//                   </div>
//                 )}
//                 <p className="text-sm font-bold text-white tracking-tight mb-1.5">
//                   Camera is off
//                 </p>
//                 <p className="text-[11px] text-zinc-400 max-w-sm">
//                   Turn on video to improve communication cues and posture
//                   analysis.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="absolute top-4 left-4 z-20">
//           <div
//             className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl transition-all duration-300 ${isAgentSpeaking ? "bg-primary/10 border-primary/20" : "bg-black/40"}`}
//           >
//             {isAgentSpeaking && (
//               <div className="flex gap-0.5 items-end h-2.5">
//                 <div className="w-0.5 h-full bg-primary animate-[music-bar_0.8s_ease-in-out_infinite]" />
//                 <div className="w-0.5 h-2/3 bg-primary animate-[music-bar_1s_ease-in-out_infinite]" />
//                 <div className="w-0.5 h-full bg-primary animate-[music-bar_1.2s_ease-in-out_infinite]" />
//               </div>
//             )}
//             <span
//               className={`text-[9px] font-bold uppercase tracking-[0.1em] ${isAgentSpeaking ? "text-primary" : "text-white"}`}
//             >
//               {isAgentSpeaking
//                 ? `${agentName} Speaking`
//                 : isAiThinking
//                   ? "Thinking..."
//                   : isUserSpeaking
//                     ? "Listening..."
//                     : agentName}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Picture-in-Picture Mini View */}
//       <button
//         onClick={toggleVideoFocus}
//         className="absolute bottom-4 right-4 z-30 group"
//       >
//         <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
//         <div className="relative aspect-video w-40 md:w-48 bg-zinc-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-[1.02] active:scale-95">
//           {isUserFocus ? (
//             <div className="w-full h-full flex items-center justify-center bg-zinc-950/50">
//               <div className="relative w-12 h-12 rounded-full p-0.5 bg-zinc-800 border border-white/10 overflow-hidden">
//                 <img
//                   src={getAgentImage(agentName)}
//                   alt={agentName}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </div>
//           ) : isVideoOn ? (
//             <video
//               ref={localVideoRef}
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-full object-cover mirror"
//             />
//           ) : (
//             <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 gap-1">
//               {userAvatar ? (
//                 <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-800/60">
//                   <img
//                     src={userAvatar}
//                     alt="You"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               ) : (
//                 <FiUser className="text-xl" />
//               )}
//               <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-500">
//                 Camera Off
//               </span>
//             </div>
//           )}
//           <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
//             <div
//               className={`w-1 h-1 rounded-full ${isVideoOn ? "bg-emerald-500" : "bg-zinc-600"}`}
//             />
//             <span className="text-[8px] font-bold text-white uppercase tracking-wider">
//               {isUserFocus ? agentName : "You"}
//             </span>
//           </div>
//         </div>
//       </button>
//     </div>
//   );
// };

// export default InterviewerSection;

import React from "react";
import { FiUser, FiVideo } from "react-icons/fi";
import AgentLoopedVideoAvatar from "./AgentLoopedVideoAvatar";

// ─────────────────────────────────────────────────────────────────────────────
// InterviewerSection  (main export – drop-in replacement)
// ─────────────────────────────────────────────────────────────────────────────
const InterviewerSection = ({
  activeCodingTask,
  hasCallEnded,
  isAgentSpeaking,
  isAiThinking,
  isUserSpeaking,
  isUserFocus,
  isVideoOn,
  callStatus,
  connectionStatus,
  transcriptCount,
  userAvatar,
  agentName,
  getAgentImage,
  getAgentVideo, // kept for backward-compat but no longer used internally
  agentVisualState,
  enableLoopedVideoAvatar,
  localVideoRef,
  agentVolumeCircleRef,
  toggleVideoFocus,
  // Optional: pass the full animations map for the selected agent.
  // If not provided the component will infer from agentMedia via getAgentVideo.
  agentAnimations,
}) => {
  const isConnecting =
    connectionStatus !== "Connected" ||
    callStatus === "loading" ||
    callStatus === "connecting";

  const isWaitingToStart = !isConnecting && transcriptCount === 0;
  const avatarObjectPosition = "50% 28%";

  // If the parent doesn't forward agentAnimations, try to reconstruct a
  // minimal map using the getAgentVideo helper so we stay backwards-compatible.
  const animations =
    agentAnimations ??
    (getAgentVideo
      ? {
          idle: getAgentVideo(agentName, "idle"),
          speaking: getAgentVideo(agentName, "speaking"),
          thinking: getAgentVideo(agentName, "idle"),
          listening: getAgentVideo(agentName, "idle"),
        }
      : null);

  return (
    <div
      className={`relative aspect-video bg-zinc-900/40 rounded-[28px] overflow-hidden border border-white/5 transition-all duration-700 ${
        activeCodingTask
          ? "scale-95 blur-xl"
          : "scale-100 blur-0 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
      }`}
    >
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(190,242,100,0.14),transparent_45%),radial-gradient(circle_at_78%_20%,rgba(59,130,246,0.14),transparent_48%),linear-gradient(to_bottom,rgba(9,9,11,0.2),rgba(9,9,11,0.9))]" />

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {!activeCodingTask && !hasCallEnded && (
          <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse-slow pointer-events-none" />
        )}

        {/* ── Main Speaker Area ── */}
        <div
          className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${
            activeCodingTask ? "scale-75" : "scale-100"
          }`}
        >
          {/* Agent view */}
          {!isUserFocus && (
            <>
              {/* ── Video / Image Avatar ── */}
              <AgentLoopedVideoAvatar
                animations={animations}
                fallbackImageSrc={getAgentImage(agentName)}
                fallbackImageAlt={agentName}
                agentVisualState={agentVisualState}
                enabled={enableLoopedVideoAvatar}
                objectPosition={avatarObjectPosition}
              />

              {/* Volume circle ref overlay */}
              <div
                ref={agentVolumeCircleRef}
                className="absolute inset-0 pointer-events-none"
              />
            </>
          )}

          {/* Connecting banner */}
          {!isUserFocus && isConnecting && (
            <div className="absolute left-4 right-4 bottom-4 z-20 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                    Connecting Session
                  </p>
                  <p className="text-[11px] sm:text-xs text-zinc-300 mt-1">
                    Initializing voice engine and live transcript...
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full border border-primary/30 border-t-primary animate-spin" />
              </div>
            </div>
          )}

          {/* Waiting-to-start tips */}
          {!isUserFocus && isWaitingToStart && (
            <div className="absolute left-4 right-4 bottom-4 z-20 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary mb-1">
                    Interview Tip
                  </p>
                  <p className="text-[11px] text-zinc-200 leading-relaxed">
                    Keep answers structured: context, action, and impact.
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-300 mb-1">
                    Audio Check
                  </p>
                  <p className="text-[11px] text-zinc-200 leading-relaxed">
                    Speak naturally. Pause briefly after each answer.
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300 mb-1">
                    Camera Framing
                  </p>
                  <p className="text-[11px] text-zinc-200 leading-relaxed">
                    Keep your face centered for better feedback quality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User video (when focused) */}
          {isUserFocus && isVideoOn && (
            <div className="w-full h-full p-2">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/5"
              />
            </div>
          )}

          {/* Camera-off placeholder (when user-focused, no video) */}
          {isUserFocus && !isVideoOn && (
            <div className="absolute inset-0 p-4 sm:p-6 z-10">
              <div className="h-full w-full rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
                {userAvatar ? (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-white/10 overflow-hidden mb-3">
                    <img
                      src={userAvatar}
                      alt="You"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mb-3">
                    <FiVideo className="text-zinc-300" size={24} />
                  </div>
                )}
                <p className="text-sm font-bold text-white tracking-tight mb-1.5">
                  Camera is off
                </p>
                <p className="text-[11px] text-zinc-400 max-w-sm">
                  Turn on video to improve communication cues and posture
                  analysis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Speaking indicator badge ── */}
        <div className="absolute top-4 left-4 z-20">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl transition-all duration-300 ${
              isAgentSpeaking
                ? "bg-primary/10 border-primary/20"
                : "bg-black/40"
            }`}
          >
            {isAgentSpeaking && (
              <div className="flex gap-0.5 items-end h-2.5">
                <div className="w-0.5 h-full bg-primary animate-[music-bar_0.8s_ease-in-out_infinite]" />
                <div className="w-0.5 h-2/3 bg-primary animate-[music-bar_1s_ease-in-out_infinite]" />
                <div className="w-0.5 h-full bg-primary animate-[music-bar_1.2s_ease-in-out_infinite]" />
              </div>
            )}
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.1em] ${
                isAgentSpeaking ? "text-primary" : "text-white"
              }`}
            >
              {isAgentSpeaking
                ? `${agentName} Speaking`
                : isAiThinking
                  ? "Thinking..."
                  : isUserSpeaking
                    ? "Listening..."
                    : agentName}
            </span>
          </div>
        </div>
      </div>

      {/* ── Picture-in-Picture mini view ── */}
      <button
        onClick={toggleVideoFocus}
        className="absolute bottom-4 right-4 z-30 group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
        <div className="relative aspect-video w-40 md:w-48 bg-zinc-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-[1.02] active:scale-95">
          {isUserFocus ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950/50">
              <div className="relative w-12 h-12 rounded-full p-0.5 bg-zinc-800 border border-white/10 overflow-hidden">
                <img
                  src={getAgentImage(agentName)}
                  alt={agentName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 gap-1">
              {userAvatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-zinc-800/60">
                  <img
                    src={userAvatar}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <FiUser className="text-xl" />
              )}
              <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                Camera Off
              </span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
            <div
              className={`w-1 h-1 rounded-full ${isVideoOn ? "bg-emerald-500" : "bg-zinc-600"}`}
            />
            <span className="text-[8px] font-bold text-white uppercase tracking-wider">
              {isUserFocus ? agentName : "You"}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default InterviewerSection;
