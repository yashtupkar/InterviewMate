/**
 * Microsoft Edge Neural Voice Configurations (English)
 * Maps agent names and voice types to Edge Neural voice IDs
 */

export const EDGE_VOICES = {
  // Premium Azure Dragon HD Voices (US English)
  en_US_Ava_Dragon: {
    id: "en-US-Ava:DragonHDLatestNeural",
    name: "Ava HD (US Female)",
    description: "Premium ultra-realistic HD voice (Dragon model)",
    language: "en-US",
    gender: "female",
  },
  en_US_Andrew_Dragon: {
    id: "en-US-Andrew:DragonHDLatestNeural",
    name: "Andrew HD (US Male)",
    description: "Premium ultra-realistic HD voice (Dragon model)",
    language: "en-US",
    gender: "male",
  },
  en_US_Adam_Dragon: {
    id: "en-US-Adam:DragonHDLatestNeural",
    name: "Adam HD (US Male)",
    description: "Premium warm conversational HD voice (Dragon model)",
    language: "en-US",
    gender: "male",
  },
  en_US_Alloy_Dragon: {
    id: "en-US-Alloy:DragonHDLatestNeural",
    name: "Alloy HD (US Male)",
    description: "Premium versatile HD voice (Dragon model)",
    language: "en-US",
    gender: "male",
  },
  en_US_Aria_Dragon: {
    id: "en-US-Aria:DragonHDLatestNeural",
    name: "Aria HD (US Female)",
    description: "Premium expressive conversational HD voice (Dragon model)",
    language: "en-US",
    gender: "female",
  },
  en_US_Bree_Dragon: {
    id: "en-US-Bree:DragonHDLatestNeural",
    name: "Bree HD (US Female)",
    description: "Premium energetic HD voice (Dragon model)",
    language: "en-US",
    gender: "female",
  },
  en_US_Brian_Dragon: {
    id: "en-US-Brian:DragonHDLatestNeural",
    name: "Brian HD (US Male)",
    description: "Premium youthful HD voice (Dragon model)",
    language: "en-US",
    gender: "male",
  },

  // Premium Azure Dragon HD Voices (Indian English)
  en_IN_Diya_Dragon: {
    id: "en-IN-Diya:DragonHDLatestNeural",
    name: "Diya HD (IN Female)",
    description: "Premium Indian English HD voice (Dragon model)",
    language: "en-IN",
    gender: "female",
  },
  en_IN_Meera_Dragon: {
    id: "en-IN-Meera:DragonHDLatestNeural",
    name: "Meera HD (IN Female)",
    description: "Premium conversational Indian English HD voice (Dragon model)",
    language: "en-IN",
    gender: "female",
  },

  // US English Voices
  en_US_Aria: {
    id: "en-US-AriaNeural",
    name: "Aria (US Female)",
    description: "Empathetic and professional",
    language: "en-US",
    gender: "female",
    sampleUrl: "/tts-assets/voices/aria.mp3",
  },
  en_US_Guy: {
    id: "en-US-GuyNeural",
    name: "Guy (US Male)",
    description: "Clear and analytical",
    language: "en-US",
    gender: "male",
    sampleUrl: "/tts-assets/voices/guy.mp3",
  },
  en_US_Jenny: {
    id: "en-US-JennyNeural",
    name: "Jenny (US Female)",
    description: "Friendly and natural",
    language: "en-US",
    gender: "female",
  },
  en_US_Ava: {
    id: "en-US-AvaNeural",
    name: "Ava (US Female)",
    description: "Cheerful and creative",
    language: "en-US",
    gender: "female",
  },
  en_US_Amanda: {
    id: "en-US-AmandaMultilingualNeural",
    name: "Amanda (US Female)",
    description: "Multilingual US female voice",
    language: "en-US",
    gender: "female",
  },
  en_US_Andrew: {
    id: "en-US-AndrewNeural",
    name: "Andrew (US Male)",
    description: "Solid and reliable",
    language: "en-US",
    gender: "male",
  },
  en_US_Christopher: {
    id: "en-US-ChristopherNeural",
    name: "Christopher (US Male)",
    description: "Bold and confident",
    language: "en-US",
    gender: "male",
  },
  en_US_Emma: {
    id: "en-US-EmmaNeural",
    name: "Emma (US Female)",
    description: "Clear and articulate",
    language: "en-US",
    gender: "female",
  },
  en_US_Eric: {
    id: "en-US-EricNeural",
    name: "Eric (US Male)",
    description: "Professional and formal",
    language: "en-US",
    gender: "male",
  },

  // UK English Voices
  en_GB_Sonia: {
    id: "en-GB-SoniaNeural",
    name: "Sonia (UK Female)",
    description: "Polite and British standard",
    language: "en-GB",
    gender: "female",
  },
  en_GB_Ryan: {
    id: "en-GB-RyanNeural",
    name: "Ryan (UK Male)",
    description: "Clear and British professional",
    language: "en-GB",
    gender: "male",
  },
  en_GB_Libby: {
    id: "en-GB-LibbyNeural",
    name: "Libby (UK Female)",
    description: "Warm and engaging British tone",
    language: "en-GB",
    gender: "female",
  },
  en_GB_Thomas: {
    id: "en-GB-ThomasNeural",
    name: "Thomas (UK Male)",
    description: "Formal and academic British voice",
    language: "en-GB",
    gender: "male",
  },

  // Indian English Voices
  en_IN_Neerja: {
    id: "en-IN-NeerjaNeural",
    name: "Neerja (IN Female)",
    description: "Clear and formal Indian accent",
    language: "en-IN",
    gender: "female",
  },
  en_IN_Prabhat: {
    id: "en-IN-PrabhatNeural",
    name: "Prabhat (IN Male)",
    description: "Professional Indian male",
    language: "en-IN",
    gender: "male",
  },

  // Australian English Voices
  en_AU_Natasha: {
    id: "en-AU-NatashaNeural",
    name: "Natasha (AU Female)",
    description: "Natural Australian female voice",
    language: "en-AU",
    gender: "female",
  },
  en_AU_William: {
    id: "en-AU-WilliamNeural",
    name: "William (AU Male)",
    description: "Reliable Australian male voice",
    language: "en-AU",
    gender: "male",
  },

  // Canadian English Voices
  en_CA_Clara: {
    id: "en-CA-ClaraNeural",
    name: "Clara (CA Female)",
    description: "Friendly Canadian female voice",
    language: "en-CA",
    gender: "female",
  },
  en_CA_Liam: {
    id: "en-CA-LiamNeural",
    name: "Liam (CA Male)",
    description: "Clear Canadian male voice",
    language: "en-CA",
    gender: "male",
  },
};

/**
 * Agent-to-Voice Mapping
 * Maps agent names to specific Edge Neural voices
 */
export const AGENT_VOICE_MAPPING = {
  sophia: {
    voiceId: "en-US-AvaNeural",
    description: "Empathetic and people-focused",
    personality: "Warm and supportive",
    color: "#ec4899",
  },
  rohan: {
    voiceId: "en-US-GuyNeural",
    description: "Analytical and logical",
    personality: "Professional and structured",
    color: "#6366f1",
  },
  marcus: {
    voiceId: "en-US-ChristopherNeural",
    description: "Bold and direct",
    personality: "Assertive and confident",
    color: "#f59e0b",
  },
  emma: {
    voiceId: "en-US-AmandaMultilingualNeural",
    description: "Creative and unconventional",
    personality: "Enthusiastic and innovative",
    color: "#10b981",
  },
  drew: {
    voiceId: "en-US-AndrewNeural",
    description: "Solid and reliable",
    personality: "Professional and deep",
    color: "#3b82f6",
  },
  rachel: {
    voiceId: "en-US-EmmaNeural",
    description: "Clear and articulate",
    personality: "Confident and friendly",
    color: "#d946ef",
  },
};

/**
 * Get voice ID from agent name
 * @param {string} agentName
 * @returns {string} Voice ID
 */
export const getVoiceIdFromAgent = (agentName) => {
  if (!agentName) return "en-US-AvaNeural";

  const agent = AGENT_VOICE_MAPPING[agentName.toLowerCase()];
  if (agent) return agent.voiceId;

  // Fallback to default voice
  return "en-US-AvaNeural";
};

/**
 * Get agent metadata from agent name
 * @param {string} agentName
 * @returns {Object} Agent metadata
 */
export const getAgentMetadata = (agentName) => {
  return (
    AGENT_VOICE_MAPPING[agentName?.toLowerCase()] || AGENT_VOICE_MAPPING.sophia
  );
};

/**
 * Get voice configuration by voice ID
 * @param {string} voiceId
 * @returns {Object} Voice configuration
 */
export const getVoiceConfig = (voiceId) => {
  const voice = Object.values(EDGE_VOICES).find((v) => v.id === voiceId);
  return voice || EDGE_VOICES.en_US_Ava;
};

/**
 * List all available voices
 * @returns {Array} Array of voice configurations
 */
export const getAllVoices = () => {
  return Object.values(EDGE_VOICES);
};

/**
 * List all female voices
 * @returns {Array}
 */
export const getFemaleVoices = () => {
  return Object.values(EDGE_VOICES).filter((v) => v.gender === "female");
};

/**
 * List all male voices
 * @returns {Array}
 */
export const getMaleVoices = () => {
  return Object.values(EDGE_VOICES).filter((v) => v.gender === "male");
};

/**
 * Get all agent names
 * @returns {Array}
 */
export const getAllAgents = () => {
  return Object.keys(AGENT_VOICE_MAPPING);
};

export default {
  EDGE_VOICES,
  AGENT_VOICE_MAPPING,
  getVoiceIdFromAgent,
  getAgentMetadata,
  getVoiceConfig,
  getAllVoices,
  getFemaleVoices,
  getMaleVoices,
  getAllAgents,
};
