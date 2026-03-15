/**
 * GDAnalyzer — AI service for Group Discussion
 * Uses OpenRouter (same pattern as InterviewResponseAnalyzer)
 */

const MODELS = [
  "google/gemini-3.1-flash-lite-preview",
  // Fastest 2026 free model
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash",      // High quality free backup
  // Legacy free backup
  "meta-llama/llama-3.3-70b-instruct", // Quality fallback
];

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractJson(rawString) {
  const codeBlockMatch = rawString.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (codeBlockMatch) return codeBlockMatch[1];
  const jsonMatch = rawString.match(/{[\s\S]*}/);
  if (jsonMatch) return jsonMatch[0];
  return rawString.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
}

async function callOpenRouter(prompt, temperature = 0.7, timeoutMs = 30000) {
  const API_KEY = (process.env.OPENROUTER_API_KEY || "").trim();

  if (!API_KEY) throw new Error("OPENROUTER_API_KEY is not set");

  for (const model of MODELS) {
    try {
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://localhost:5173",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature,
          }),
        },
        timeoutMs
      );

      if (response.status === 429) {
        console.warn(`[GDAnalyzer] ${model} rate-limited, trying next...`);
        continue;
      }
      if (!response.ok) {
        const err = await response.text();
        console.warn(`[GDAnalyzer] ${model} failed (${response.status}): ${err} — trying next...`);
        continue;
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.warn(`[GDAnalyzer] ${model} error: ${error.message}`);
      if (MODELS.indexOf(model) === MODELS.length - 1) throw error;
    }
  }
}

/**
 * Opening statement — the VERY FIRST agent to speak opens the GD.
 */
const getOpeningStatement = async (agent, topic) => {
  const prompt = `You are ${agent.name} opening a GD on: "${topic}".
Personality: ${agent.personality}

STRICT TASK: Open the discussion in ONE SENTENCE. 
- Take a sharp stance immediately. 
- Use a verbal filler like "Look," "Honestly," or "Actually."
- NO GREETINGS. NO "I am listening."

Example: "Honestly, remote work is clearly more productive because it cuts out the office politics and commute stress."

Respond ONLY with that one sentence.`;

  const text = await callOpenRouter(prompt, 0.85, 25000);
  return (text || "").trim();
};

/**
 * Get an agent's next spoken response given the full transcript context.
 */
const getAgentResponse = async (agent, topic, transcriptLines, userLastMessage) => {
  const transcriptStr = transcriptLines
    .slice(-20)
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const prompt = `You are ${agent.name} in a GD on: "${topic}".
Current Context: ${transcriptStr}
${userLastMessage ? `User said: "${userLastMessage}"` : ""}

TASK: Counter or support the last point in ONE SHORT SENTENCE.
- Be opinionated. 
- Use "Wait," "But," "Precisely," or "I disagree."
- NO polite phrases. 

Respond ONLY with that one sentence.`;

  const text = await callOpenRouter(prompt, 0.85, 25000);
  return (text || "").trim();
};

/**
 * Proactive agent turn — agent jumps in unprompted with a new angle.
 */
const getProactiveAgentResponse = async (agent, topic, transcriptLines) => {
  const transcriptStr = transcriptLines
    .slice(-10)
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const prompt = `You are ${agent.name} in a GD on: "${topic}".
Context: ${transcriptStr || "(Start of discussion)"}

TASK: Jump in with ONE sharp point or counter-point.
- ONE SENTENCE MAX.
- Use natural interruption: "Actually, look at it this way...", "But what about...", "Indeed, but..."
- No fluff.

Respond ONLY with that sentence.`;

  const text = await callOpenRouter(prompt, 0.9, 25000);
  return (text || "").trim();
};

/**
 * Analyze the full GD transcript and generate a user contribution report.
 */
const analyzeGDTranscript = async (topic, transcript, userName) => {
  const transcriptStr = transcript
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const userTurns = transcript.filter((t) => t.role === "user");
  const totalTurns = transcript.length;

  const prompt = `You are an expert Group Discussion evaluator. 
Analyze this group discussion on topic: "${topic}"

Participants: ${userName} (the candidate being evaluated) and AI agents.

Full Transcript:
"""
${transcriptStr}
"""

The user's name in the transcript is "${userName}". Evaluate ONLY the user's performance.

Evaluate on these dimensions (score 0-100 each):
1. contributionScore - How much and how often did the user speak meaningfully?
2. communicationScore - Was the user's language clear, articulate, and confident?
3. relevanceScore - Did the user's points stay on topic and add value?
4. initiationScore - Did the user take initiative and introduce new angles?
5. depthScore - Did the user show depth of knowledge and reasoning?

Return ONLY a JSON object:
{
  "overallScore": number,
  "contributionScore": number,
  "communicationScore": number,
  "relevanceScore": number,
  "initiationScore": number,
  "depthScore": number,
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "summary": "2-3 sentence overall assessment of the user's GD performance"
}`;

  try {
    const raw = await callOpenRouter(prompt, 0.3, 60000);
    const jsonStr = extractJson(raw);
    const result = JSON.parse(jsonStr);
    result.userTurnCount = userTurns.length;
    result.totalTurns = totalTurns;
    return result;
  } catch (error) {
    console.error("GD analysis error:", error);
    throw error;
  }
};

module.exports = { getOpeningStatement, getAgentResponse, getProactiveAgentResponse, analyzeGDTranscript };
