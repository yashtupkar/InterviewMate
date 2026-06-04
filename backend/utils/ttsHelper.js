/**
 * Reusable TTS Helper Module
 * QUALITY FIX: Enhances Azure Neural TTS audio quality settings
 */

/**
 * Returns SpeechConfig options with the highest quality format settings.
 * @returns {Object} SpeechConfig settings
 */
const getSpeechConfig = () => {
  // QUALITY FIX: request highest quality MP3 format supported by Azure (48kHz, 192kbps)
  return {
    outputFormat: "audio-48khz-192kbitrate-mono-mp3",
    contentType: "application/ssml+xml",
    userAgent: "PlaceMateAI"
  };
};

/**
 * Encapsulates XML escaping and builds a high-quality SSML prosody wrapper.
 * @param {string} text - Clean text to speak
 * @param {string} voice - Azure Neural Voice ID
 * @param {number} rate - Prosody speed rate (default 0.95)
 * @returns {string} SSML payload
 */
const buildSSML = (text, voice, rate = 0.95) => {
  // QUALITY FIX: sanitize/escape XML special characters
  const escapedText = text.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });

  // QUALITY FIX: derive locale (e.g. "en-US") dynamically from the voice name format
  const parts = voice.split("-");
  const locale = (parts[0] && parts[1]) ? `${parts[0]}-${parts[1]}` : "en-US";

  // QUALITY FIX: custom prosody settings for premium quality matching the Voice Gallery
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
    <voice name="${voice}">
      <prosody rate="${rate}" pitch="0%" volume="loud">
        ${escapedText}
      </prosody>
    </voice>
  </speak>`;
};

module.exports = {
  getSpeechConfig,
  buildSSML
};
