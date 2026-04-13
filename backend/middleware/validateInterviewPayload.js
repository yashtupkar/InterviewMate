const validateInterviewPayload = (req, res, next) => {
  const { interviewMode, sourceType, content, skills } = req.body;

  const mode = interviewMode === "skillsBased" ? "skillsBased" : "roleBased";
  const normalizedSkills = Array.isArray(skills)
    ? skills
        .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
        .filter(Boolean)
    : [];

  const textContent = typeof content === "string" ? content.trim() : "";

  if (mode === "skillsBased" && normalizedSkills.length === 0) {
    return res.status(400).json({
      message: "At least one skill is required for a skills-based interview.",
      code: "MISSING_SKILLS",
    });
  }

  const sourceRequiresText = [
    "resume",
    "job-description",
    "resume-job-description",
    "skills-resume",
    "skills-job-description",
    "skills-resume-job-description",
  ];

  if (sourceRequiresText.includes(sourceType) && !textContent) {
    return res.status(400).json({
      message: "Interview context content is required for the selected source.",
      code: "MISSING_CONTENT",
    });
  }

  const totalLength = textContent.length + normalizedSkills.join(" ").length;
  if (totalLength > 12000) {
    return res.status(400).json({
      message:
        "Combined interview context is too long. Please shorten your resume/job description or skills.",
      code: "CONTENT_TOO_LONG",
      maxAllowed: 12000,
      provided: totalLength,
    });
  }

  req.body.skills = normalizedSkills;
  req.body.interviewMode = mode;

  return next();
};

module.exports = validateInterviewPayload;
