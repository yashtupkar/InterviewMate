const axios = require("axios");

const DEEPGRAM_ENDPOINT =
  process.env.DEEPGRAM_ENDPOINT || "https://api.deepgram.com/v1/listen";

const mapLanguage = (lang = "en-US") => {
  if (!lang || typeof lang !== "string") return "en";
  return lang.split("-")[0].toLowerCase();
};

const transcribeAudio = async ({ audioBuffer, mimeType, language }) => {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("Deepgram is not configured on server.");
  }

  if (!audioBuffer || !audioBuffer.length) {
    throw new Error("Audio payload is empty.");
  }

  const response = await axios.post(
    DEEPGRAM_ENDPOINT,
    audioBuffer,
    {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": mimeType || "audio/webm",
      },
      params: {
        model: "nova-3",
        smart_format: true,
        punctuate: true,
        language: mapLanguage(language),
      },
      timeout: 30000,
      maxBodyLength: 10 * 1024 * 1024,
    },
  );

  const firstAlternative =
    response.data?.results?.channels?.[0]?.alternatives?.[0] || {};

  return {
    text: (firstAlternative.transcript || "").trim(),
    confidence: firstAlternative.confidence || 0,
    provider: "deepgram",
    duration:
      response.data?.metadata?.duration ||
      response.data?.results?.metadata?.duration ||
      null,
  };
};

module.exports = {
  transcribeAudio,
};
