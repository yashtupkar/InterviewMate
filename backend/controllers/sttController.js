const axios = require("axios");

exports.getDeepgramToken = async (req, res) => {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error("DEEPGRAM_API_KEY is not defined in the backend environment");
      return res.status(500).json({ error: "Deepgram API key is missing in server configuration." });
    }

    try {
      // Call Deepgram v1/auth/grant endpoint to generate a short-lived token (expires in 5 minutes)
      const response = await axios.post(
        "https://api.deepgram.com/v1/auth/grant",
        {
          ttl_seconds: 300 // 5 minutes validity
        },
        {
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data && response.data.access_token) {
        return res.json({ token: response.data.access_token });
      }
    } catch (grantErr) {
      // Check if it's a permission/forbidden error, in which case we fall back to the actual API key
      const isForbidden = grantErr.response?.status === 403 || 
                          grantErr.response?.data?.err_code === "FORBIDDEN" ||
                          (typeof grantErr.response?.data?.err_msg === "string" && 
                           grantErr.response?.data?.err_msg.toLowerCase().includes("permission"));
      
      if (isForbidden) {
        console.warn("[STT] Deepgram /v1/auth/grant returned Forbidden (Insufficient permissions). Falling back to using the API Key directly.");
        return res.json({ token: apiKey, isFallback: true });
      }
      
      throw grantErr; // Re-throw other errors (network, 500, etc.)
    }

    // Default fallback in case response structure was unexpected
    return res.json({ token: apiKey, isFallback: true });

  } catch (err) {
    console.error("Failed to generate Deepgram token:", err.response?.data || err.message);
    
    // Ultimate fallback: return the master API key so the frontend can function
    if (process.env.DEEPGRAM_API_KEY) {
      console.warn("[STT] Ultimate fallback: returning DEEPGRAM_API_KEY directly.");
      return res.json({ token: process.env.DEEPGRAM_API_KEY, isFallback: true });
    }
    
    return res.status(500).json({ error: "Failed to generate temporary Deepgram token." });
  }
};
