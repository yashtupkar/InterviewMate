const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "that",
  "this",
  "from",
  "you",
  "your",
  "will",
  "have",
  "are",
  "our",
  "their",
  "about",
  "into",
  "role",
  "work",
  "years",
  "experience",
  "team",
  "skills",
  "using",
]);

const SKILL_CATEGORIES = {
  "Programming Languages": [
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "rust",
    "c++",
    "c#",
    "c",
  ],
  Frontend: [
    "react",
    "next.js",
    "vue",
    "angular",
    "tailwind",
    "redux",
    "html",
    "css",
  ],
  Backend: [
    "node.js",
    "express",
    "nestjs",
    "django",
    "flask",
    "spring",
    "graphql",
    "rest api",
  ],
  Database: [
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "dynamodb",
    "elasticsearch",
  ],
  "Cloud/DevOps": [
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "ci/cd",
    "jenkins",
  ],
  Tools: ["git", "github", "gitlab", "jira", "postman", "figma", "vscode"],
  Testing: [
    "jest",
    "pytest",
    "cypress",
    "selenium",
    "unit testing",
    "integration testing",
  ],
  Architecture: [
    "microservices",
    "system design",
    "event-driven",
    "serverless",
    "scalability",
  ],
};

const ROLE_PATTERNS = [
  {
    regex: /full\s*stack\s+(developer|engineer)/i,
    role: "Full Stack Developer",
    confidence: 0.95,
  },
  {
    regex: /frontend\s+(developer|engineer)/i,
    role: "Frontend Developer",
    confidence: 0.95,
  },
  {
    regex: /backend\s+(developer|engineer)/i,
    role: "Backend Developer",
    confidence: 0.95,
  },
  {
    regex: /react\s+(developer|engineer)/i,
    role: "React Developer",
    confidence: 0.88,
  },
  {
    regex: /node\.?js\s+(developer|engineer)/i,
    role: "Node.js Developer",
    confidence: 0.88,
  },
  { regex: /devops\s+engineer/i, role: "DevOps Engineer", confidence: 0.95 },
  {
    regex: /software\s+engineer/i,
    role: "Software Engineer",
    confidence: 0.72,
  },
];

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (value) =>
  String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const tokenize = (text) =>
  normalizeText(text)
    .split(/[^a-z0-9+.#/-]+/)
    .filter((token) => token && token.length > 2 && !STOPWORDS.has(token));

const extractResumeSkills = (resumeData) => {
  const flat = (resumeData?.skills || []).flatMap((item) => {
    if (!item) return [];

    return String(item?.subSkills || "")
      .split(",")
      .map((skill) => normalizeText(skill))
      .filter(Boolean);
  });

  return new Set(flat);
};

const countSkillMentions = (jobDescription) => {
  const jd = normalizeText(jobDescription);
  const matches = [];

  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    for (const skill of skills) {
      if (!jd.includes(skill)) continue;

      const mentionCount = (
        jd.match(
          new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ) || []
      ).length;

      matches.push({
        skill,
        category,
        mentions: mentionCount,
      });
    }
  }

  return matches;
};

const detectSuggestedRole = (jobDescription) => {
  for (const pattern of ROLE_PATTERNS) {
    if (pattern.regex.test(jobDescription || "")) {
      return {
        role: pattern.role,
        confidence: pattern.confidence,
      };
    }
  }

  return null;
};

const buildKeywordSuggestions = (jobDescription, skillMatches) => {
  const tokenFreq = new Map();
  for (const token of tokenize(jobDescription)) {
    tokenFreq.set(token, (tokenFreq.get(token) || 0) + 1);
  }

  const topGeneric = [...tokenFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({
      keyword,
      section: "overall",
      priority: count >= 2 ? "high" : "medium",
    }));

  const skillKeywords = skillMatches.flatMap((match) => [
    {
      keyword: match.skill,
      section: "summary",
      priority: match.mentions >= 2 ? "high" : "medium",
    },
    {
      keyword: match.skill,
      section: "experience",
      priority: match.mentions >= 2 ? "high" : "medium",
    },
  ]);

  const deduped = new Map();
  [...skillKeywords, ...topGeneric].forEach((item) => {
    const key = `${item.keyword}|${item.section}`;
    if (!deduped.has(key)) deduped.set(key, item);
  });

  return [...deduped.values()].slice(0, 30);
};

const detectMissingSkills = (skillMatches, resumeSkillSet) =>
  skillMatches
    .filter((match) => !resumeSkillSet.has(normalizeText(match.skill)))
    .map((match) => ({
      skill: titleCase(match.skill),
      category: match.category,
      reason: "Found in JD but not clearly reflected in current resume skills.",
      priority: match.mentions >= 2 ? "high" : "medium",
    }));

const analyzeJobDescription = ({ jobDescription = "", resumeData = {} }) => {
  const normalizedJD = normalizeText(jobDescription);

  if (!normalizedJD) {
    return {
      hasJobDescription: false,
      suggestedRole: null,
      keywordSuggestions: [],
      missingSkills: [],
      summary: "No JD provided; using general resume best practices.",
    };
  }

  const skillMatches = countSkillMentions(jobDescription);
  const resumeSkillSet = extractResumeSkills(resumeData);

  return {
    hasJobDescription: true,
    suggestedRole: detectSuggestedRole(jobDescription),
    keywordSuggestions: buildKeywordSuggestions(jobDescription, skillMatches),
    missingSkills: detectMissingSkills(skillMatches, resumeSkillSet),
    summary:
      "JD analyzed for role alignment, keyword targeting, and category-based skill gaps.",
  };
};

module.exports = {
  analyzeJobDescription,
};
