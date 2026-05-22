/**
 * Edge TTS Voice Configurations
 * Maps agent names and voice types to Edge TTS voice IDs
 */

export const EDGE_VOICES = {
  // Female Voices
  JENNY: {
    id: "en-US-JennyNeural",
    name: "Jenny",
    description: "Professional female voice",
    language: "en-US",
    gender: "female",
  },
  ARIA: {
    id: "en-US-AriaNeural",
    name: "Aria",
    description: "Creative female voice",
    language: "en-US",
    gender: "female",
  },
  SARA: {
    id: "en-US-SaraNeural",
    name: "Sara",
    description: "Clear female voice",
    language: "en-US",
    gender: "female",
  },

  // Male Voices
  GUY: {
    id: "en-US-GuyNeural",
    name: "Guy",
    description: "Professional male voice",
    language: "en-US",
    gender: "male",
  },
  DAVIS: {
    id: "en-US-DavisNeural",
    name: "Davis",
    description: "Bold male voice",
    language: "en-US",
    gender: "male",
  },
  CHRISTOPHER: {
    id: "en-US-ChristopherNeural",
    name: "Christopher",
    description: "Solid male voice",
    language: "en-US",
    gender: "male",
  },
};

/**
 * Agent-to-Voice Mapping
 * Maps agent names to specific Edge TTS voices
 */
export const AGENT_VOICE_MAPPING = {
  sophia: {
    voiceId: "en-US-JennyNeural",
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
    voiceId: "en-US-DavisNeural",
    description: "Bold and direct",
    personality: "Assertive and confident",
    color: "#f59e0b",
  },
  emma: {
    voiceId: "en-US-AriaNeural",
    description: "Creative and unconventional",
    personality: "Enthusiastic and innovative",
    color: "#10b981",
  },
  drew: {
    voiceId: "en-US-ChristopherNeural",
    description: "Solid and reliable",
    personality: "Professional and deep",
    color: "#3b82f6",
  },
  rachel: {
    voiceId: "en-US-SaraNeural",
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
  if (!agentName) return "en-US-JennyNeural";

  const agent = AGENT_VOICE_MAPPING[agentName.toLowerCase()];
  if (agent) return agent.voiceId;

  // Fallback to default voice
  return "en-US-JennyNeural";
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
  return voice || EDGE_VOICES.JENNY;
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
