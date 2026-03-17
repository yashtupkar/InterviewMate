/**
 * LinkedInService — AI service for LinkedIn Profile & Content Optimization
 * Uses OpenRouter for LLM communication.
 */

const MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05", // Fast and powerful
  "google/gemini-2.0-flash",
  "meta-llama/llama-3.3-70b-instruct",
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

async function callOpenRouter(prompt, temperature = 0.7, timeoutMs = 45000) {
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
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature,
          }),
        },
        timeoutMs
      );

      if (response.status === 429) continue;
      if (!response.ok) continue;

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "";
    } catch (error) {
      if (MODELS.indexOf(model) === MODELS.length - 1) throw error;
    }
  }
}

/**
 * Analyzes LinkedIn profile text (About/Headline)
 */
const analyzeLinkedInProfile = async (profileText) => {
  const prompt = `Analyze this LinkedIn profile content and provide a detailed assessment.
  CONTENT: "${profileText}"
  
  TASK:
  1. Calculate an overall "Profile Strength" score (0-100).
  2. Identify specific strengths.
  3. Provide actionable, high-impact improvements.
  4. Evaluate "Searchability" (Keywords) and "Engagement" (Hook/Value).
  5. Rewrite the provided content into a highly optimized "Improved Version" that follows LinkedIn best practices.

  Return ONLY a JSON object:
  {
    "score": number,
    "analysis": {
      "searchability": number,
      "engagement": number,
      "clarity": number
    },
    "strengths": ["string"],
    "improvements": [
      { "point": "string", "reason": "string" }
    ],
    "improvedVersion": "string (The fully rewritten and optimized profile content)",
    "summary": "string (2-3 sentences)"
  }`;

  const raw = await callOpenRouter(prompt, 0.4);
  return JSON.parse(extractJson(raw));
};

/**
 * Generates LinkedIn Headlines
 */
const generateHeadlines = async (role, skills) => {
  const prompt = `Generate 5 high-converting LinkedIn Headlines for a professional.
  ROLE: ${role}
  SKILLS: ${skills}

  STYLES:
  1. Professional/Corporate
  2. Benefit-Driven (What you solve)
  3. Achievement-Oriented (Numbers/Impact)
  4. Creative/Punchy
  5. Minimalist

  Rules: Max 220 characters each. Use professional emojis sparingly. No hashtags.

  Return ONLY a JSON array of strings.`;

  const raw = await callOpenRouter(prompt, 0.8);
  return JSON.parse(extractJson(raw));
};

/**
 * Optimizes "About" section
 */
const optimizeAboutSection = async (rawText, coreFocus) => {
  const prompt = `Rewrite this LinkedIn "About" section to be more engaging and structured.
  RAW TEXT: "${rawText}"
  CORE FOCUS: "${coreFocus}"

  STRUCTURE:
  - Strong Hook (First 2 lines)
  - Mission/Value Proposition
  - Key Achievements/Excellence
  - Keywords/Tech Stack
  - Call to Action

  TONE: Professional yet approachable. Use first-person "I".
  RULES: Use bullet points for readability. NO markdowns like **.

  Return ONLY the optimized text.`;

  const text = await callOpenRouter(prompt, 0.7);
  return text.trim();
};

/**
 * Creates a LinkedIn Post
 */
const createLinkedInPost = async (topic, goal) => {
  const prompt = `Create a high-impact LinkedIn post about: "${topic}".
  GOAL: ${goal}

  STRUCTURE:
  - Hook (Thought-provoking question or bold statement)
  - The "Meat" (Value/Insight/Story)
  - Lesson/Takeaway
  - Call to Interaction (Question for audience)
  - 3-5 Relevant Hashtags

  STYLE: Spaced out for readability. No big blocks of text.

  Return ONLY the post text.`;

  const text = await callOpenRouter(prompt, 0.85);
  return text.trim();
};

module.exports = {
  analyzeLinkedInProfile,
  generateHeadlines,
  optimizeAboutSection,
  createLinkedInPost
};
