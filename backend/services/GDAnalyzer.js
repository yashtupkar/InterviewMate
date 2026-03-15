/**
 * GDAnalyzer — AI service for Group Discussion
 * Uses OpenRouter (same pattern as InterviewResponseAnalyzer)
 */

const MODELS = [
  "google/gemini-3-flash-preview",   // free tier, no credits needed
  "google/gemini-2.5-flash",        // free tier fallback
  "google/gemini-3.1-flash-lite-preview",       // paid fallback
  "openai/gpt-4o-mini-2024-07-18",                  // paid fallback
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
        continue; // try next model instead of throwing
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
 * Must introduce the topic and share a clear stance.
 */
const getOpeningStatement = async (agent, topic) => {
  const prompt = `You are ${agent.name} and you are OPENING a group discussion on: "${topic}".

Your personality: ${agent.personality}

You are the FIRST speaker. Your job right now:
1. State the topic clearly in one sentence.
2. Immediately share YOUR own stance or perspective on it — are you for it, against it, or nuanced?
3. Give ONE strong reason or example to support your initial stance.

CRITICAL — you MUST NOT say any of the following:
- "I am listening" / "I'm listening"
- "let's get started" / "welcome"
- "great topic" / "interesting topic"
- Any form of greeting or introduction of yourself
- Asking others what they think (don't hand the floor to others yet)

Just speak your mind directly, as if you are confidently opening a real debate room.
Keep it to 3-4 spoken sentences. No markdown, no bullet points.

Respond ONLY with ${agent.name}'s spoken words.`;

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

  const prompt = `You are ${agent.name} in a live group discussion on: "${topic}".

Your personality: ${agent.personality}

Conversation so far:
${transcriptStr}

${userLastMessage ? `The user just said: "${userLastMessage}"` : ""}

Your task: Respond as ${agent.name} — react to what was said, challenge it, agree partially, or add a new angle.

STRICT RULES:
- 2-4 sentences, natural spoken language, no markdown.
- Do NOT say: "I am listening", "I'm listening", "That's a great point", "Welcome", "As an AI".
- Do NOT ask the user or others to speak — you are expressing YOUR view.
- Be direct, opinionated, and confident per your personality.

Respond ONLY with ${agent.name}'s words.`;

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

  const prompt = `You are ${agent.name} in a live group discussion on: "${topic}".

Your personality: ${agent.personality}

Recent exchange:
${transcriptStr || "(The discussion just started.)"}

You are jumping in proactively. Pick ONE of these moves:
- Introduce a COUNTER-argument to what was last said.
- Bring in a REAL-WORLD example or statistic that supports or challenges a point.
- Introduce a NEW angle on the topic that hasn't been discussed yet.

STRICT RULES — you MUST NOT say:
- "I am listening" / "I'm listening" / "I agree" alone without elaboration.
- "That's interesting" / "Great point" / "Welcome everyone".
- Any passive filler. You are jumping in with SUBSTANCE.

2-3 sharp, confident spoken sentences. No markdown.

Respond ONLY with ${agent.name}'s words.`;

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
