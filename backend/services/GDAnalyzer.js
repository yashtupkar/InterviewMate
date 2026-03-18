/**
 * GDAnalyzer — AI service for Group Discussion
 * Uses OpenRouter (same pattern as InterviewResponseAnalyzer)
 */

const MODELS = [
  "google/gemini-3.1-flash-lite-preview", // Fastest 2026 free model
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
  const prompt = `You are ${agent.name} starting a Group Discussion on: "${topic}".
Personality: ${agent.personality}

TASK: Start the GD with a short self-introduction and your basic view on the topic.

RULES:
- Use SIMPLE language that everyone can understand. No complex words.
- Tone: Natural Indian-English style.
- Start like: "Hello everyone, I am ${agent.name}. I'd like to start our discussion on..."
- Keep it ONE or TWO short, clear sentences.
- Use a natural Indian filler like "So," "Well," or "Actually."
- NO "Good morning/evening."

Example: "Hello everyone, I am Rohan. I'd like to start our discussion on remote work. Actually, I feel that working from home makes us much more comfortable and productive."

Respond ONLY with the sentence.`;

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

  const prompt = `You are ${agent.name} participating in a Group Discussion on: "${topic}".
Current Discussion History:
${transcriptStr}

${userLastMessage ? `User just said: "${userLastMessage}"` : ""}

TASK: Respond to the current discussion flow with a more detailed point.
- LENGTH: Use 1-2 natural sentences.
- HUMAN-LIKE: Speak like a real person in a GD. Use personality: ${agent.personality}.
- AVOID REPETITION: Do NOT repeat points that have already been made by you or others in the history. Bring in a NEW perspective or build upon a previous point with a specific reason.
- TONE: Natural Indian-English conversation. 
- FILLERS: Start with natural phrases like "I see your point, but...", "That's an interesting angle, actually...", "If I could add to that...", "To be honest, the way I look at it is...".
- NO ROBOTIC SUMMARIES: Don't just summarize what others said. Take a stand.
- CRITICAL: This response for text to speech so dont add markdowns or any special characters like ** or ## or ** make it natural and human like 


Respond ONLY with your spoken lines.`;

  const text = await callOpenRouter(prompt, 0.85, 25000);
  return (text || "").trim();
};

/**
 * Proactive agent turn — agent jumps in unprompted with a new angle.
 */
const getProactiveAgentResponse = async (agent, topic, transcriptLines) => {
  const transcriptStr = transcriptLines
    .slice(-15)
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const prompt = `You are ${agent.name} in a GD on: "${topic}".
Personality: ${agent.personality}

Discussion Summary so far:
${transcriptStr || "(The discussion just started)"}

TASK: Proactively jump in with a fresh perspective or a counter-argument.
- LENGTH: 1-2 clear, impactful sentences.
- NO REPETITION: Scan the history above. Do NOT say anything that has already been mentioned. If the discussion is stagnating, pivot to a slightly different aspect of the topic.
- NATURAL INTERRUPTIONS: Use varied starters: "Wait, I think we're missing something critical here...", "Actually, if you look at the industry trends...", "I'd like to bring in another point about...", "Sorry to jump in, but has anyone considered...".
- STYLE: Direct, opinionated, and conversational. 
- CRITICAL: This response for text to speech so dont add markdowns or any special characters like ** or ## or ** make it natural and human like 

Respond ONLY with your spoken lines.`;

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
4. initiationScore - Did the user take initiative, start the discussion, or introduce new angles?
5. depthScore - Did the user show depth of knowledge and reasoning?
6. speakingScore - Evaluate the user's verbal delivery, clarity, and tone.

Return ONLY a JSON object:
{
  "overallScore": number,
  "contributionScore": number,
  "communicationScore": number,
  "relevanceScore": number,
  "initiationScore": number,
  "depthScore": number,
  "speakingScore": number,
  "initiationBonus": boolean, (true if the user was the FIRST participant to speak and contribute a point after the AI opener's introduction)
  "conclusionBonus": boolean, (true if the user provided a final summary or a concluding statement that wrapped up the discussion)
  "strengths": ["string", "string", "string"],
  "improvements": [
    {
      "point": "Short improvement title",
      "explanation": "Detailed explanation of what to improve and how."
    }
  ],
  "summary": "2-3 sentence overall assessment of the user's GD performance",
  "speakingStyle": "A short analysis of their verbal communication style (e.g., assertive, collaborative, hesitant)"
} (Make sure to provide at least 3 detailed improvements)`;

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

/**
 * Conclusion statement — one agent wraps up the discussion.
 */
const getConclusionStatement = async (agent, topic, transcriptLines) => {
  const transcriptStr = transcriptLines
    .slice(-25) // Take more context for a better summary
    .map((t) => `${t.speaker}: ${t.text}`)
    .join("\n");

  const prompt = `You are ${agent.name} delivering the final conclusion for a Group Discussion on: "${topic}".
Current Discussion Context:
${transcriptStr}

TASK: Synthesize the discussion into a structured, professional, and balanced summary.
- LENGTH: 3-4 natural sentences.
- STRUCTURE:
  1. Formal Opening: Start with a professional phrase (e.g., "To conclude our discussion on ${topic}...", "As we wrap up this session...", "Summarizing the key points of our discussion...").
  2. Balanced Synthesis: Acknowledge the core themes discussed. Explicitly mention that some participants shared certain views (benefits/pros) while others raised different points (concerns/cons).
  3. Consensus Status: Mention where the group reached a common ground or note if there are varying perspectives that still remain.
  4. Forward-Looking Statement: Conclude with a global outlook or a recommendation based on the collective points.

RULES:
- AVOID REPETITION: Do not just list what individuals said; blend them into thematic categories.
- PROFESSIONAL TONE: Use a mature, analytical, and professional tone instead of casual chat.
- VARIATION: Do not be robotic. Use varied transitions like "While we touched upon...", "A significant part of our dialogue focused on...", "The consensus seems to be...".
- TTS SAFETY: This is for Text-to-Speech. DO NOT use markdown (no **, ##, etc.), lists, or special characters. Use plain text only.

Respond ONLY with your concluding lines.`;

  const text = await callOpenRouter(prompt, 0.75, 25000);
  return (text || "").trim();
};

module.exports = {
  getOpeningStatement,
  getAgentResponse,
  getProactiveAgentResponse,
  getConclusionStatement,
  analyzeGDTranscript
};
