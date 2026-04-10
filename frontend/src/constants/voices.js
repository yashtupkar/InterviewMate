/**
 * AWS Polly Voice Configurations
 * Maps agent names and voice types to AWS Polly voice IDs
 */

export const POLLY_VOICES = {
  // Female Voices
  JOANNA: {
    id: "Joanna",
    name: "Joanna",
    description: "Professional female voice",
    language: "en-US",
    gender: "female",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/joanna.mp3",
  },
  IVY: {
    id: "Ivy",
    name: "Ivy",
    description: "Young female voice",
    language: "en-US",
    gender: "female",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/ivy.mp3",
  },
  KIMBERLY: {
    id: "Kimberly",
    name: "Kimberly",
    description: "Clear female voice",
    language: "en-US",
    gender: "female",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/kimberly.mp3",
  },
  KENDRA: {
    id: "Kendra",
    name: "Kendra",
    description: "Friendly female voice",
    language: "en-US",
    gender: "female",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/kendra.mp3",
  },
  SALLI: {
    id: "Salli",
    name: "Salli",
    description: "Confident female voice",
    language: "en-US",
    gender: "female",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/salli.mp3",
  },

  // Male Voices
  MATTHEW: {
    id: "Matthew",
    name: "Matthew",
    description: "Professional male voice",
    language: "en-US",
    gender: "male",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/matthew.mp3",
  },
  JUSTIN: {
    id: "Justin",
    name: "Justin",
    description: "Deep male voice",
    language: "en-US",
    gender: "male",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/justin.mp3",
  },
  LIAM: {
    id: "Liam",
    name: "Liam",
    description: "Formal male voice",
    language: "en-US",
    gender: "male",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/liam.mp3",
  },
  JOEY: {
    id: "Joey",
    name: "Joey",
    description: "Energetic male voice",
    language: "en-US",
    gender: "male",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/joey.mp3",
  },
  KEVIN: {
    id: "Kevin",
    name: "Kevin",
    description: "Clear male voice",
    language: "en-US",
    gender: "male",
    engine: "neural",
    sampleUrl: "/tts-assets/voices/kevin.mp3",
  },
};

/**
 * Agent-to-Voice Mapping
 * Maps agent names to specific Polly voices
 */
export const AGENT_VOICE_MAPPING = {
  sophia: {
    voiceId: "Joanna",
    description: "Empathetic and people-focused",
    personality: "Warm and supportive",
    color: "#ec4899",
  },
  rohan: {
    voiceId: "Matthew",
    description: "Analytical and logical",
    personality: "Professional and structured",
    color: "#6366f1",
  },
  marcus: {
    voiceId: "Joey",
    description: "Bold and direct",
    personality: "Assertive and confident",
    color: "#f59e0b",
  },
  emma: {
    voiceId: "Kendra",
    description: "Creative and unconventional",
    personality: "Enthusiastic and innovative",
    color: "#10b981",
  },
  drew: {
    voiceId: "Justin",
    description: "Solid and reliable",
    personality: "Professional and deep",
    color: "#3b82f6",
  },
  rachel: {
    voiceId: "Kimberly",
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
  if (!agentName) return "Joanna";

  const agent = AGENT_VOICE_MAPPING[agentName.toLowerCase()];
  if (agent) return agent.voiceId;

  // Fallback to default voice
  return "Joanna";
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
  const voice = Object.values(POLLY_VOICES).find((v) => v.id === voiceId);
  return voice || POLLY_VOICES.JOANNA;
};

/**
 * List all available voices
 * @returns {Array} Array of voice configurations
 */
export const getAllVoices = () => {
  return Object.values(POLLY_VOICES);
};

/**
 * List all female voices
 * @returns {Array}
 */
export const getFemaleVoices = () => {
  return Object.values(POLLY_VOICES).filter((v) => v.gender === "female");
};

/**
 * List all male voices
 * @returns {Array}
 */
export const getMaleVoices = () => {
  return Object.values(POLLY_VOICES).filter((v) => v.gender === "male");
};

/**
 * Get all agent names
 * @returns {Array}
 */
export const getAllAgents = () => {
  return Object.keys(AGENT_VOICE_MAPPING);
};

export default {
  POLLY_VOICES,
  AGENT_VOICE_MAPPING,
  getVoiceIdFromAgent,
  getAgentMetadata,
  getVoiceConfig,
  getAllVoices,
  getFemaleVoices,
  getMaleVoices,
  getAllAgents,
};
