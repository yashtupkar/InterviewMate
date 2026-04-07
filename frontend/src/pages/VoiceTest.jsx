import React, { useState, useContext } from "react";
import { interviewAgents } from "../constants/agents";
import usePollyTTS from "../hooks/usePollyTTS";
import { AppContext } from "../context/AppContext";

const VoiceTest = () => {
  const [text, setText] = useState(
    "Hello, I am testing this voice. How do I sound?",
  );
  const [playingAgent, setPlayingAgent] = useState(null);
  const { speakText } = usePollyTTS();
  const { backend_URL } = useContext(AppContext);

  // Voice mapping for agents (changed Marcus and Emma to new voices)
  const voiceMapping = {
    Sophia: "Joanna", // Female, US
    Rohan: "Matthew", // Male, US
    Marcus: "Joey", // Male, energetic
    Emma: "Kendra", // Female, different tone
    Drew: "Justin", // Male, deep and proper ✨ UPDATED
    Rachel: "Kimberly", // Female, different tone ✨ UPDATED
  };

  const playVoice = async (agentName) => {
    try {
      setPlayingAgent(agentName);
      const voiceId = voiceMapping[agentName] || agentName;

      await speakText(text, voiceId, {
        onComplete: () => setPlayingAgent(null),
        onError: () => setPlayingAgent(null),
      });
    } catch (error) {
      console.error("Error playing voice:", error);
      setPlayingAgent(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Voice Testing</h1>
          <p className="text-zinc-400">
            Test the text-to-speech voices for each agent.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-zinc-300">
            Test Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#bef264]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {interviewAgents
            .filter((a) =>
              ["Rohan", "Sophia", "Marcus", "Emma", "Drew", "Rachel"].includes(
                a.name,
              ),
            )
            .map((agent) => (
              <div
                key={agent.name}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover bg-zinc-800"
                  />
                  <div>
                    <h3 className="font-bold">{agent.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {voiceMapping[agent.name] || agent.label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => playVoice(agent.name)}
                  disabled={playingAgent === agent.name}
                  className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                    playingAgent === agent.name
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-[#bef264] text-black hover:bg-[#a3e14d]"
                  }`}
                >
                  {playingAgent === agent.name ? "Playing..." : "Play"}
                </button>
              </div>
            ))}
        </div>

        <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400 mb-4">
            AWS Polly Voices (Neural Engine)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <div>
              <span className="font-bold text-[#bef264]">Sophia:</span> Joanna
              (Female)
            </div>
            <div>
              <span className="font-bold text-[#bef264]">Rohan:</span> Matthew
              (Male)
            </div>
            <div>
              <span className="font-bold text-[#bef264]">Marcus:</span> Joey
              (Male) ✨ NEW
            </div>
            <div>
              <span className="font-bold text-[#bef264]">Emma:</span> Kendra
              (Female) ✨ NEW
            </div>
            <div>
              <span className="font-bold text-[#bef264]">Drew:</span> Justin
              (Male) ✨ UPDATED
            </div>
            <div>
              <span className="font-bold text-[#bef264]">Rachel:</span> Kimberly
              (Female) ✨ UPDATED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
