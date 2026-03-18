import React, { useState, useEffect } from "react";
import { interviewAgents } from "../constants/agents";

const VoiceTest = () => {
  const [text, setText] = useState("Hello, I am testing this voice. How do I sound?");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const playVoice = (agentName) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(true);

    const agent = interviewAgents.find(a => a.name === agentName);
    const config = agent?.browserVoiceConfig || (["Rohan", "Marcus", "Drew"].includes(agentName) 
      ? { gender: 'male', pitch: 1.0, rate: 1.0, keywords: ["Google UK English Male", "David", "Male"] }
      : { gender: 'female', pitch: 1.0, rate: 1.0, keywords: ["Google US English", "Samantha", "Female"] });

    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    let voice = null;
    for (const kw of config.keywords) {
      voice = voices.find(v => v.name.includes(kw) && v.lang.includes("en"));
      if (voice) break;
    }

    if (!voice) {
      voice = voices.find(v => (config.gender === 'female' ? (v.name.includes("Female") || v.name.includes("Zira")) : (v.name.includes("Male") || v.name.includes("David"))) && v.lang.includes("en"));
    }

    if (!voice) {
      voice = voices.find(v => v.lang.includes("en"));
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Voice Testing</h1>
          <p className="text-zinc-400">Test the text-to-speech voices for each agent.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-zinc-300">Test Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#bef264]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {interviewAgents.filter(a => ["Rohan", "Sophia", "Marcus", "Emma", "Drew", "Rachel"].includes(a.name)).map(agent => (
            <div key={agent.name} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-full object-cover bg-zinc-800" />
                <div>
                  <h3 className="font-bold">{agent.name}</h3>
                  <p className="text-xs text-zinc-500">{agent.label}</p>
                </div>
              </div>
              <button
                onClick={() => playVoice(agent.name)}
                className="px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3e14d] transition-colors"
              >
                Play
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400 mb-2">Available System Voices: {availableVoices.length}</p>
          <div className="h-32 overflow-y-auto">
            {availableVoices.map((v, i) => (
              <div key={i} className="text-xs text-zinc-500 py-1">{v.name} ({v.lang})</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
