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
- ACT AS A CANDIDATE: You are a fellow candidate participating in this Group Discussion, not an expert or examiner.
- Use SIMPLE language that everyone can understand. No complex words. Use easy, basic English.
- SMALL POINTS: Keep your point small, concise, and very easy to follow.
- Tone: Natural Indian-English style.
- Start like: "Hello everyone, I am ${agent.name}. I'd like to start our discussion on..."
- Keep it ONE or TWO short, clear sentences.
- HUMAN FUMBLES: Use natural human fumbles and fillers to sound authentic (e.g., "uh", "um", "like", "actually", "hm", "oh"). 
- NO "Good morning/evening."

Example: "Hello everyone, I am Rohan. I'd like to start our discussion on remote work. Actually, I feel that, working from home makes us much more comfortable and productive."

Respond ONLY with the sentence.`;

  const text = await callOpenRouter(prompt, 0.85, 25000);
  return (text || "").trim();
};

/**
 * Get an agent's next spoken response given the full transcript context.
 */
const getAgentResponse = async (agent, topic, transcriptLines, userLastMessage, allAgents = [], isInterrupt = false) => {
  const lastSpeaker = transcriptLines.at(-1)?.speaker || "";
  const otherAgentNames = allAgents
    .filter((a) => a.name !== agent.name)
    .map((a) => a.name)
    .join(", ");

  const connectorRule = isInterrupt
    ? `Start with an interrupt connector: "Sorry to cut in, but...", "Wait, sorry to interrupt, but...", "Actually, if I could just jump in..."`
    : `Start with a connector: "I see your point...", "Building on what ${lastSpeaker} said...", "I'd push back here...", "Actually, I think...", "That's true, but..."`;

  const prompt = `You are ${agent.name} in a Group Discussion on: "${topic}".
Personality: ${agent.personality}
Behavior guide:
${agent.behaviorHint || ""}

Other participants: ${otherAgentNames}, and the user.

Recent discussion:
${transcriptLines.slice(-15).map((t) => `${t.speaker}: ${t.text}`).join("\n")}

${userLastMessage ? `User just said: "${userLastMessage}"` : `Last speaker was ${lastSpeaker}.`}

TASK: React naturally to what was just said.

STRICT RULES:
- ACT AS A CANDIDATE, not an expert.
- MENTION THE LAST SPEAKER by name if reacting to them. E.g., "I agree with ${lastSpeaker} on that, but..."
- 1-2 sentences MAX. Short and punchy.
- PERSONALITY: ${agent.personality}
- FUMBLES: Use "uh", "hm", "actually", "like" naturally.
- DO NOT repeat any point already in the history above.
- NO markdown, no ** or ##. Plain text only (TTS safe).
- IF your personality is assertive: push back or add a strong counter.
- IF your personality is agreeable: validate then add a small new point.
- IF your personality is analytical: bring in a fact, number, or logical angle.

${connectorRule}

Respond ONLY with your spoken words.`;

  const text = await callOpenRouter(prompt, 0.85, 25000);
  return (text || "").trim();
};

/**
 * Proactive agent turn — agent jumps in unprompted with a new angle.
 */
const getProactiveAgentResponse = async (agent, topic, transcriptLines, allAgents = []) => {
  const otherNames = allAgents
    .filter((a) => a.name !== agent.name)
    .map((a) => a.name)
    .join(", ");

  const prompt = `You are ${agent.name} in a GD on: "${topic}".
Personality: ${agent.personality}
Behavior guide:
${agent.behaviorHint || ""}

Other candidates in the room: ${otherNames}

Recent discussion:
${transcriptLines.slice(-12).map((t) => `${t.speaker}: ${t.text}`).join("\n")}

TASK: Jump in proactively. Choose ONE of these modes based on context:
- COUNTER: If the last point seems one-sided, challenge it.
- PIVOT: If the discussion feels repetitive (scan recent messages), introduce a fresh angle.
- INVITE: If the user hasn't spoken in the last 4-5 turns, say something like 
  "I'd love to hear what [user] thinks about this too."
- AGREE+ADD: If a good point was made, validate it and add one new layer.

RULES:
- 1-2 sentences only.
- Sound like you just thought of it: "Oh wait, actually...", "Hmm, I want to add something here...",
  "Sorry to jump in, but has anyone thought about..."
- Use filler words naturally: "uh", "hm", "like", "actually"
- NO repetition of points already discussed.
- NO markdown. Plain text only.
- Mention another candidate's name if reacting to their specific point.

Respond ONLY with your spoken words.`;

  const text = await callOpenRouter(prompt, 0.9, 25000);
  return (text || "").trim();
};

/**
 * NEW: Call out the user directly when they've been silent
 */
const getUserPressurePrompt = async (agent, topic, transcriptLines, userName) => {
  const lastPoint = transcriptLines.at(-1)?.text || "";

  const prompt = `You are ${agent.name} in a GD on: "${topic}".
Personality: ${agent.personality}
Behavior guide:
${agent.behaviorHint || ""}

The user "${userName}" has not spoken in a while.

Last point made: "${lastPoint}"

TASK: Naturally call out ${userName} to share their view. 
- Sound casual and collegial, not like an examiner.
- Reference the last point or topic to make it feel natural.
- If userName is "you" or "User", address them directly in the second person (e.g., "what do you think about this?" or "I'd love to hear your take") without using the word "you" or "User" as a name.
- Examples:
  "By the way, ${userName === "you" || userName === "User" ? "what do you think" : `${userName}, what do you think`} about this?"
  "Hm, we haven't heard from ${userName === "you" || userName === "User" ? "you" : userName} yet — what's your take?"
  "Actually, do you agree with what was just said?"
- Keep it 1 sentence only.
- NO markdown. Plain text only.

Respond ONLY with your spoken line.`;

  const text = await callOpenRouter(prompt, 0.85, 20000);
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
- LENGTH: 2-3 natural sentences.
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
  analyzeGDTranscript,
  getUserPressurePrompt
};
