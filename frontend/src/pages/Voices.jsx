import React, { useState, useEffect } from "react";
import { interviewAgents } from "../constants/agents";
import useEdgeTTS from "../hooks/useEdgeTTS";
import { EDGE_VOICES, AGENT_VOICE_MAPPING } from "../constants/edgeVoices";
import { shouldUseBrowserNativeTTS } from "../utils/browserDetection";

const CHROME_AGENT_VOICE_MAPPING = {
  sophia: {
    voiceId: "Google US English",
    color: "#ec4899",
    description: "Clear and fluent US English female voice",
  },
  rohan: {
    voiceId: "Google UK English Male",
    color: "#6366f1",
    description: "Refined British male voice (Fast & Intellectual)",
  },
  marcus: {
    voiceId: "Google UK English Male",
    color: "#f59e0b",
    description: "Bold and assertive British male voice",
  },
  emma: {
    voiceId: "Google UK English Female",
    color: "#10b981",
    description: "Creative British English female voice",
  },
  drew: {
    voiceId: "Google India English Male",
    color: "#3b82f6",
    description: "Deep and structured Indian male voice",
  },
  rachel: {
    voiceId: "Google US English",
    color: "#d946ef",
    description: "Articulate US English female voice",
  },
};

const getNativeVoiceGender = (voiceName) => {
  const lower = voiceName.toLowerCase();
  if (
    lower.includes("male") ||
    lower.includes("david") ||
    lower.includes("guy") ||
    lower.includes("george") ||
    lower.includes("ravi") ||
    lower.includes("daniel")
  ) {
    return "male";
  }
  return "female";
};

const getNativeVoiceDescription = (voice) => {
  if (voice.localService) {
    return "Offline-capable high-quality local synthesizer voice.";
  }
  return "Premium cloud-delivered neural voice from Google Speech API.";
};

const Voices = () => {
  const [text, setText] = useState(
    "Hello! I am testing this premium voice in my browser. How do I sound to you?",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [browserVoices, setBrowserVoices] = useState([]);
  const [edgeVoices, setEdgeVoices] = useState(Object.values(EDGE_VOICES));
  const [loadingBackendVoices, setLoadingBackendVoices] = useState(false);
  
  const { speakText, isPlaying, stopSpeaking, getAvailableVoices } = useEdgeTTS();
  const isChromeBrowser = shouldUseBrowserNativeTTS();

  // Load browser native voices dynamically for Chrome
  useEffect(() => {
    if (!isChromeBrowser || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter only English voices
      const englishVoices = allVoices.filter(
        (v) => v.lang.startsWith("en") || v.lang.includes("en-"),
      );
      setBrowserVoices(englishVoices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isChromeBrowser]);

  // Load Azure Neural voices dynamically for non-Chrome browsers
  useEffect(() => {
    if (isChromeBrowser) return;

    let isMounted = true;
    const loadBackendVoices = async () => {
      try {
        setLoadingBackendVoices(true);
        const voicesData = await getAvailableVoices();
        if (isMounted && voicesData && Array.isArray(voicesData)) {
          setEdgeVoices(voicesData);
        }
      } catch (err) {
        console.error("Failed to load voices from Azure backend:", err);
      } finally {
        if (isMounted) setLoadingBackendVoices(false);
      }
    };

    loadBackendVoices();
    return () => {
      isMounted = false;
    };
  }, [isChromeBrowser, getAvailableVoices]);

  const edgeVoicesList = edgeVoices;

  // Grouped regions/accents for filtering
  const regions = [
    { label: "All Regions", value: "All" },
    { label: "United States (US)", value: "US" },
    { label: "United Kingdom (UK)", value: "GB" },
    { label: "India (IN)", value: "IN" },
    { label: "Australia (AU)", value: "AU" },
    { label: "Canada (CA)", value: "CA" },
  ];

  // Filter Edge voices for non-Chrome browsers
  const filteredEdgeVoices = edgeVoicesList.filter((voice) => {
    const matchesRegion =
      selectedRegion === "All" || voice.language.includes(selectedRegion);
    const matchesGender =
      selectedGender === "All" || voice.gender === selectedGender;
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesGender && matchesSearch;
  });

  // Filter Chrome browser native voices
  const filteredBrowserVoices = browserVoices.filter((voice) => {
    const gender = getNativeVoiceGender(voice.name);
    // e.g. "en-US" -> "US", "en-GB" -> "GB"
    const regionCode = voice.lang.split("-")[1] || "";
    const matchesRegion =
      selectedRegion === "All" || regionCode.toUpperCase() === selectedRegion.toUpperCase();
    const matchesGender =
      selectedGender === "All" || gender === selectedGender;
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.lang.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesGender && matchesSearch;
  });

  const playVoice = async (voiceId) => {
    try {
      if (isPlaying) {
        stopSpeaking();
        if (playingVoiceId === voiceId) {
          setPlayingVoiceId(null);
          return;
        }
      }

      setPlayingVoiceId(voiceId);
      await speakText(text, voiceId, {
        onComplete: () => setPlayingVoiceId(null),
        onError: () => setPlayingVoiceId(null),
      });
    } catch (error) {
      console.error("Error playing voice preview:", error);
      setPlayingVoiceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 sm:p-10 font-sans selection:bg-[#bef264] selection:text-black">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] text-xs font-semibold uppercase tracking-wider mb-3">
              {isChromeBrowser ? "⚡ Google Web Speech API (Chrome Native)" : "⚡ Azure Neural TTS Engine"}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              {isChromeBrowser ? "Chrome Web Speech Voices" : "English Neural Voices"}
            </h1>
            <p className="text-zinc-400 mt-1 max-w-xl">
              {isChromeBrowser
                ? "Testing Chrome's default browser Speech API. We've listed all available native English voices in your system."
                : "Explore and test high-quality, ultra-realistic English text-to-speech voices powered by Azure Neural networks (Microsoft Cognitive Services)."}
            </p>
          </div>
          {isPlaying && (
            <button
              onClick={stopSpeaking}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              Stop Playback
            </button>
          )}
        </div>

        {/* Custom Test Text Input */}
        <div className="p-6 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
              Customize Voice Test Sentence
            </label>
            <span className="text-xs text-zinc-500">{text.length}/3000 chars</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.substring(0, 3000))}
            placeholder="Type anything here to test the voices..."
            className="w-full h-24 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-all duration-200 text-sm leading-relaxed resize-none"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Mapped Agent Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🤖 Active Agent Voices
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                These are the English voices assigned to the 6 PlaceMateAI agents on this browser.
              </p>
              <div className="space-y-3 pt-2">
                {interviewAgents
                  .filter((a) =>
                    ["Sophia", "Rohan", "Marcus", "Emma", "Drew", "Rachel"].includes(
                      a.name,
                    ),
                  )
                  .map((agent) => {
                    const isChrome = isChromeBrowser;
                    const mapping = isChrome
                      ? CHROME_AGENT_VOICE_MAPPING[agent.name.toLowerCase()]
                      : AGENT_VOICE_MAPPING[agent.name.toLowerCase()];
                    
                    return (
                      <div
                        key={agent.name}
                        onClick={() => playVoice(isChrome ? agent.name : mapping.voiceId)}
                        className="group p-3.5 bg-zinc-950/80 hover:bg-[#bef264]/5 border border-zinc-800/60 hover:border-[#bef264]/30 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={agent.image}
                              alt={agent.name}
                              className="w-10 h-10 rounded-full object-cover bg-zinc-800 border border-zinc-700 group-hover:border-[#bef264]/40 transition-all duration-300"
                            />
                            <div
                              className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] border border-zinc-950 font-bold"
                              style={{ backgroundColor: mapping.color, color: "#fff" }}
                            >
                              {agent.name.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">
                              {agent.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono">
                              {mapping.voiceId}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            playingVoiceId === (isChrome ? agent.name : mapping.voiceId)
                              ? "bg-red-500/20 text-red-400"
                              : "bg-zinc-800 group-hover:bg-[#bef264] group-hover:text-black text-zinc-400"
                          }`}
                        >
                          {playingVoiceId === (isChrome ? agent.name : mapping.voiceId) ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
                          ) : (
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Voices List & Filters (Right Side) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filtering Controls */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              {/* Region Select Tabs */}
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start w-full sm:w-auto">
                {regions.map((region) => (
                  <button
                    key={region.value}
                    onClick={() => setSelectedRegion(region.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      selectedRegion === region.value
                        ? "bg-[#bef264] text-black shadow-md shadow-[#bef264]/10"
                        : "bg-zinc-950/60 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {region.label.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Gender Filter Toggle */}
              <div className="inline-flex rounded-lg border border-zinc-800 p-0.5 bg-zinc-950/60">
                {["All", "female", "male"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`px-3 py-1 text-xs font-bold capitalize rounded-md transition-all ${
                      selectedGender === gender
                        ? "bg-zinc-800 text-[#bef264]"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>

            </div>

            {/* Search and Stats bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search voices by name..."
                className="w-full sm:max-w-xs px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#bef264] text-sm"
              />
              <div className="text-xs text-zinc-500 font-medium">
                Showing{" "}
                <span className="text-[#bef264] font-bold">
                  {isChromeBrowser ? filteredBrowserVoices.length : filteredEdgeVoices.length}
                </span>{" "}
                of {isChromeBrowser ? browserVoices.length : edgeVoicesList.length} voices
              </div>
            </div>

            {/* Grid of Voices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Chrome Browser Native Voices */}
              {isChromeBrowser &&
                filteredBrowserVoices.map((voice) => {
                  const gender = getNativeVoiceGender(voice.name);
                  const description = getNativeVoiceDescription(voice);
                  return (
                    <div
                      key={voice.name}
                      className={`p-4 bg-zinc-900/30 border rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 hover:border-zinc-700/80 ${
                        playingVoiceId === voice.name
                          ? "border-[#bef264] bg-[#bef264]/5 shadow-lg shadow-[#bef264]/2"
                          : "border-zinc-800/60"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-white group-hover:text-[#bef264] transition-colors truncate">
                            {voice.name}
                          </h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {voice.lang}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                gender === "female"
                                  ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {gender}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 leading-normal">
                          {description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                        <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
                          {voice.voiceURI}
                        </span>
                        <button
                          onClick={() => playVoice(voice.name)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                            playingVoiceId === voice.name
                              ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                              : "bg-zinc-800 hover:bg-[#bef264] hover:text-black text-zinc-200"
                          }`}
                        >
                          {playingVoiceId === voice.name ? (
                            <>
                              <svg className="w-3.5 h-3.5 fill-current animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Playing
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              Test Voice
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {/* Edge Neural Voices (non-Chrome fallback) */}
              {!isChromeBrowser && loadingBackendVoices && (
                <div className="col-span-2 p-10 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                  <svg className="w-8 h-8 mx-auto text-[#bef264] mb-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading premium voices directly from Azure...
                </div>
              )}

              {!isChromeBrowser && !loadingBackendVoices &&
                filteredEdgeVoices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`p-4 bg-zinc-900/30 border rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 hover:border-zinc-700/80 ${
                      playingVoiceId === voice.id
                        ? "border-[#bef264] bg-[#bef264]/5 shadow-lg shadow-[#bef264]/2"
                        : "border-zinc-800/60"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white group-hover:text-[#bef264] transition-colors">
                          {voice.name.replace(/ \(.*\)/, "")}
                        </h3>
                        <div className="flex gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {voice.language}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              voice.gender === "female"
                                ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {voice.gender}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-normal">
                        {voice.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                      <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                        {voice.id}
                      </span>
                      <button
                        onClick={() => playVoice(voice.id)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                          playingVoiceId === voice.id
                            ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                            : "bg-zinc-800 hover:bg-[#bef264] hover:text-black text-zinc-200"
                        }`}
                      >
                        {playingVoiceId === voice.id ? (
                          <>
                            <svg className="w-3.5 h-3.5 fill-current animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Playing
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Test Voice
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

              {/* No Voices Found State */}
              {!loadingBackendVoices && ((isChromeBrowser && filteredBrowserVoices.length === 0) ||
                (!isChromeBrowser && filteredEdgeVoices.length === 0)) && (
                <div className="col-span-2 p-10 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                  <svg className="w-8 h-8 mx-auto text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  No English voices match your criteria.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Voices;
