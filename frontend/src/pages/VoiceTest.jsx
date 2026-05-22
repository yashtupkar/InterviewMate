import React, { useState, useContext, useEffect } from "react";
import { interviewAgents } from "../constants/agents";
import { getVoiceIdFromAgent } from "../constants/voices";
import usePollyTTS from "../hooks/usePollyTTS";
import { AppContext } from "../context/AppContext";

const VoiceTest = () => {
  const [text, setText] = useState(
    "Hello, I am testing this voice. How do I sound?",
  );
  const [playingVoice, setPlayingVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const { speakText, getAvailableVoices } = usePollyTTS();
  const { backend_URL } = useContext(AppContext);

  // Resolve agent -> voice using canonical mapping
  const voiceMapping = (name) => getVoiceIdFromAgent(name);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voicesData = await getAvailableVoices();
        if (voicesData) {
          if (voicesData.femaleVoices && voicesData.maleVoices) {
            const allVoices = [
              ...voicesData.femaleVoices,
              ...voicesData.maleVoices,
            ];
            setAvailableVoices(allVoices);
          } else {
            setAvailableVoices(voicesData);
          }
        }
      } catch (error) {
        console.error("Error loading voices:", error);
      } finally {
        setLoadingVoices(false);
      }
    };
    loadVoices();
  }, [getAvailableVoices]);

  const playVoice = async (voiceId) => {
    try {
      setPlayingVoice(voiceId);
      await speakText(text, voiceId, {
        onComplete: () => setPlayingVoice(null),
        onError: () => setPlayingVoice(null),
      });
    } catch (error) {
      console.error("Error playing voice:", error);
      setPlayingVoice(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Voice Testing</h1>
          <p className="text-zinc-400">
            Test the text-to-speech voices for each agent and available voices.
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

        <div>
          <h2 className="text-xl font-bold mb-4">Agent Voices</h2>
          <div className="grid grid-cols-2 gap-4">
            {interviewAgents
              .filter((a) =>
                [
                  "Rohan",
                  "Sophia",
                  "Marcus",
                  "Emma",
                  "Drew",
                  "Rachel",
                ].includes(a.name),
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
                        {voiceMapping(agent.name)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => playVoice(voiceMapping(agent.name))}
                    disabled={playingVoice === voiceMapping(agent.name)}
                    className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                      playingVoice === voiceMapping(agent.name)
                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                        : "bg-[#bef264] text-black hover:bg-[#a3e14d]"
                    }`}
                  >
                    {playingVoice === voiceMapping(agent.name)
                      ? "Playing..."
                      : "Play"}
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">All Available Voices</h2>
          {loadingVoices ? (
            <div className="p-8 text-center text-zinc-500">
              Loading voices...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableVoices
                .filter((voice) => {
                  const locale = (
                    voice.locale ||
                    voice.Locale ||
                    ""
                  ).toLowerCase();
                  return (
                    locale.startsWith("en-") ||
                    locale.startsWith("hi-") ||
                    locale.startsWith("mr-")
                  );
                })
                .map((voice) => (
                  <div
                    key={voice.id || voice.ShortName}
                    className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3"
                  >
                    <div>
                      <h3 className="font-bold text-sm">
                        {voice.name || voice.FriendlyName || voice.id}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {voice.id || voice.ShortName} •{" "}
                        {voice.locale || voice.Locale}
                      </p>
                    </div>
                    <button
                      onClick={() => playVoice(voice.id || voice.ShortName)}
                      disabled={playingVoice === (voice.id || voice.ShortName)}
                      className={`w-full px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                        playingVoice === (voice.id || voice.ShortName)
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-[#bef264] text-black hover:bg-[#a3e14d]"
                      }`}
                    >
                      {playingVoice === (voice.id || voice.ShortName)
                        ? "Playing..."
                        : "Play"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
