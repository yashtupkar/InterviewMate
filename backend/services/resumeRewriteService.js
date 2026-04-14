const MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05",
  "google/gemini-2.0-flash",
  "meta-llama/llama-3.3-70b-instruct",
];
const { analyzeJobDescription } = require("./jdAnalysisService");

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
  return rawString
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();
}

async function callOpenRouter(prompt, temperature = 0.6, timeoutMs = 45000) {
  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  for (const model of MODELS) {
    try {
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature,
          }),
        },
        timeoutMs,
      );

      if (response.status === 429) continue;
      if (!response.ok) continue;

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "";
    } catch (error) {
      if (MODELS.indexOf(model) === MODELS.length - 1) throw error;
    }
  }

  throw new Error("Unable to get a response from AI provider");
}

const rewriteResumeText = async ({ mode, target, content, metadata = {} }) => {
  const safeMode = mode === "full" ? "full" : "section";
  const safeTarget = target || "section";

  const prompt = `You are an expert resume writing assistant.
Task: Rewrite resume content to improve clarity, impact, ATS readability, and professional tone.

Mode: ${safeMode}
Target: ${safeTarget}
Candidate Context:
- Job Title: ${metadata.jobTitle || ""}
- Skills: ${Array.isArray(metadata.skills) ? metadata.skills.join(", ") : ""}

Content to rewrite:
"""
${content}
"""

Rules:
1. Keep claims realistic and do not invent achievements.
2. Preserve meaning while improving quality.
3. Use concise, high-impact language.
4. Return only valid JSON in this shape:
{
  "rewritten": "string",
  "tips": ["string"]
}`;

  const raw = await callOpenRouter(prompt, 0.55);
  const parsed = JSON.parse(extractJson(raw));

  const rewritten =
    typeof parsed?.rewritten === "string" ? parsed.rewritten.trim() : "";

  if (!rewritten) {
    throw new Error("AI rewrite returned empty content");
  }

  return {
    rewritten,
    tips: Array.isArray(parsed?.tips) ? parsed.tips : [],
  };
};

const applyIndexedUpdates = (items, updates, key) => {
  if (!Array.isArray(items) || !Array.isArray(updates)) return items;
  const cloned = [...items];

  for (const update of updates) {
    const index = Number(update?.index);
    if (!Number.isInteger(index) || index < 0 || index >= cloned.length)
      continue;
    if (typeof update?.[key] !== "string") continue;

    cloned[index] = {
      ...cloned[index],
      [key]: update[key].trim(),
    };
  }

  return cloned;
};

const applyCustomSectionUpdates = (customSections, updates) => {
  if (!Array.isArray(customSections) || !Array.isArray(updates))
    return customSections;

  return customSections.map((section) => {
    const matched = updates.find((u) => u?.sectionId === section?.id);
    if (!matched || !Array.isArray(section?.entries)) return section;

    return {
      ...section,
      entries: applyIndexedUpdates(section.entries, matched.entries, "content"),
    };
  });
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const sanitizeSentence = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const includeKeywordInText = (text, keyword) => {
  const current = String(text || "").trim();
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) return current;
  if (normalizeText(current).includes(normalizedKeyword)) return current;

  if (!current) return `${keyword}`;
  return `${sanitizeSentence(current)} Focused on ${keyword}.`;
};

const injectSectionKeywords = (rewrittenResume, keywordSuggestions) => {
  if (!rewrittenResume || !Array.isArray(keywordSuggestions)) return;

  const summaryKeywords = keywordSuggestions
    .filter((item) => item?.section === "summary")
    .map((item) => String(item.keyword || "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const experienceKeywords = keywordSuggestions
    .filter((item) => item?.section === "experience")
    .map((item) => String(item.keyword || "").trim())
    .filter(Boolean)
    .slice(0, 4);

  if (summaryKeywords.length > 0 && Array.isArray(rewrittenResume.profiles)) {
    const profileIndex = rewrittenResume.profiles.findIndex(
      (item) => item && item.visible !== false,
    );

    if (profileIndex >= 0) {
      let content = rewrittenResume.profiles[profileIndex]?.content || "";
      summaryKeywords.forEach((keyword) => {
        content = includeKeywordInText(content, keyword);
      });

      rewrittenResume.profiles[profileIndex] = {
        ...rewrittenResume.profiles[profileIndex],
        content,
      };
    }
  }

  if (
    experienceKeywords.length > 0 &&
    Array.isArray(rewrittenResume.experience)
  ) {
    const experienceIndex = rewrittenResume.experience.findIndex(
      (item) => item && item.visible !== false,
    );

    if (experienceIndex >= 0) {
      let description =
        rewrittenResume.experience[experienceIndex]?.description || "";
      experienceKeywords.forEach((keyword) => {
        description = includeKeywordInText(description, keyword);
      });

      rewrittenResume.experience[experienceIndex] = {
        ...rewrittenResume.experience[experienceIndex],
        description,
      };
    }
  }
};

const rewriteFullResumeData = async ({ resumeData, metadata = {} }) => {
  const jdInsights = analyzeJobDescription({
    jobDescription: metadata.jobDescription,
    resumeData,
  });

  const serialized = JSON.stringify(
    {
      personalInfo: {
        objective: resumeData?.personalInfo?.objective || "",
        jobTitle: resumeData?.personalInfo?.jobTitle || "",
      },
      profiles: (resumeData?.profiles || []).map((item) => ({
        title: item?.title || "",
        content: item?.content || "",
      })),
      experience: (resumeData?.experience || []).map((item) => ({
        title: item?.title || "",
        company: item?.company || "",
        description: item?.description || "",
      })),
      projects: (resumeData?.projects || []).map((item) => ({
        title: item?.title || "",
        description: item?.description || "",
      })),
      achievements: (resumeData?.achievements || []).map((item) => ({
        title: item?.title || "",
        description: item?.description || "",
      })),
      customSections: (resumeData?.customSections || []).map((section) => ({
        sectionId: section?.id || "",
        title: section?.title || "",
        entries: (section?.entries || []).map((entry) => ({
          title: entry?.title || "",
          content: entry?.content || "",
        })),
      })),
    },
    null,
    2,
  );

  const hasJobDescription =
    typeof metadata.jobDescription === "string" &&
    metadata.jobDescription.trim().length > 0;

  const prompt = `You are an expert resume editor.
Rewrite only textual content while preserving factual claims and structure.

Candidate context:
- Job Title: ${metadata.jobTitle || ""}
- Skills: ${Array.isArray(metadata.skills) ? metadata.skills.join(", ") : ""}
- Job Description Provided: ${hasJobDescription ? "Yes" : "No"}
- Pre-Analyzed JD Keywords: ${jdInsights.keywordSuggestions
    .map((item) => item.keyword)
    .slice(0, 20)
    .join(", ")}
- Pre-Analyzed Missing Skills: ${jdInsights.missingSkills
    .map((item) => item.skill)
    .slice(0, 20)
    .join(", ")}

Job Description (optional):
"""
${hasJobDescription ? metadata.jobDescription.trim() : "N/A"}
"""

Input JSON:
${serialized}

Output requirements:
1. Keep array sizes unchanged.
2. Do not invent achievements.
3. Improve clarity, impact, ATS readability, spelling, and grammar.
4. If job description is provided, tailor wording and keywords toward that JD while staying truthful.
5. If job description is not provided, optimize using general resume best practices.
6. Also identify important keyword phrases and missing skills from the JD or from general resume best practices.
7. Return only valid JSON with this exact shape:
{
  "personalInfoObjective": "string",
  "profiles": [{"index": 0, "content": "string"}],
  "experience": [{"index": 0, "description": "string"}],
  "projects": [{"index": 0, "description": "string"}],
  "achievements": [{"index": 0, "description": "string"}],
  "customSections": [{"sectionId": "string", "entries": [{"index": 0, "content": "string"}]}],
  "keywordSuggestions": [{"keyword":"string","section":"summary|experience|projects|skills|achievements","priority":"high|medium|low"}],
  "missingSkills": [{"skill":"string","category":"Programming Languages|Frontend|Backend|Database|Cloud/DevOps|Tools|Testing|Architecture","reason":"string","priority":"high|medium|low"}],
  "tips": ["string"]
}`;

  const raw = await callOpenRouter(prompt, 0.45);
  const parsed = JSON.parse(extractJson(raw));

  const rewrittenResume = JSON.parse(JSON.stringify(resumeData || {}));

  if (!rewrittenResume.personalInfo) rewrittenResume.personalInfo = {};
  if (typeof parsed?.personalInfoObjective === "string") {
    rewrittenResume.personalInfo.objective =
      parsed.personalInfoObjective.trim();
  }

  rewrittenResume.profiles = applyIndexedUpdates(
    rewrittenResume.profiles || [],
    parsed?.profiles,
    "content",
  );
  rewrittenResume.experience = applyIndexedUpdates(
    rewrittenResume.experience || [],
    parsed?.experience,
    "description",
  );
  rewrittenResume.projects = applyIndexedUpdates(
    rewrittenResume.projects || [],
    parsed?.projects,
    "description",
  );
  rewrittenResume.achievements = applyIndexedUpdates(
    rewrittenResume.achievements || [],
    parsed?.achievements,
    "description",
  );
  rewrittenResume.customSections = applyCustomSectionUpdates(
    rewrittenResume.customSections || [],
    parsed?.customSections,
  );

  const normalizedKeywordSuggestions = Array.isArray(parsed?.keywordSuggestions)
    ? parsed.keywordSuggestions
        .filter(
          (item) =>
            item && typeof item.keyword === "string" && item.keyword.trim(),
        )
        .map((item) => ({
          keyword: item.keyword.trim(),
          section:
            typeof item.section === "string" && item.section.trim()
              ? item.section.trim()
              : "experience",
          priority:
            typeof item.priority === "string" ? item.priority : "medium",
        }))
    : jdInsights.keywordSuggestions;

  const normalizedMissingSkills = Array.isArray(parsed?.missingSkills)
    ? parsed.missingSkills
        .filter(
          (item) => item && typeof item.skill === "string" && item.skill.trim(),
        )
        .map((item) => ({
          skill: item.skill.trim(),
          category:
            typeof item.category === "string" && item.category.trim()
              ? item.category.trim()
              : "Tools",
          reason:
            typeof item.reason === "string" && item.reason.trim()
              ? item.reason.trim()
              : "Suggested by AI for better JD alignment.",
          priority:
            typeof item.priority === "string" ? item.priority : "medium",
        }))
    : jdInsights.missingSkills;

  if (!rewrittenResume.personalInfo) rewrittenResume.personalInfo = {};
  if (
    jdInsights?.suggestedRole?.role &&
    Number(jdInsights?.suggestedRole?.confidence || 0) >= 0.75
  ) {
    rewrittenResume.personalInfo.jobTitle = jdInsights.suggestedRole.role;
  }

  injectSectionKeywords(rewrittenResume, normalizedKeywordSuggestions);

  return {
    rewrittenResume,
    keywordSuggestions: normalizedKeywordSuggestions,
    missingSkills: normalizedMissingSkills,
    jdInsights,
    tips: Array.isArray(parsed?.tips) ? parsed.tips : [],
  };
};

module.exports = {
  rewriteResumeText,
  rewriteFullResumeData,
};
