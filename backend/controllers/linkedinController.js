const linkedinService = require("../services/linkedinService");
const CreditService = require("../services/creditService");

// Helper to deduct credits for LinkedIn actions
const deductLinkedInCredits = async (userId) => {
  await CreditService.deduct(userId, "tools");
};

const analyzeProfile = async (req, res) => {
  try {
    const { profileText } = req.body;
    if (!profileText) return res.status(400).json({ message: "Profile text is required" });

    const result = await linkedinService.analyzeLinkedInProfile(profileText);
    await deductLinkedInCredits(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    console.error("LinkedIn Analysis Error:", error);
    res.status(500).json({ message: "Failed to analyze profile" });
  }
};

const generateHeadlines = async (req, res) => {
  try {
    const { role, skills } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });

    const headlines = await linkedinService.generateHeadlines(role, skills || "");
    await deductLinkedInCredits(req.user._id);
    res.status(200).json({ headlines });
  } catch (error) {
    console.error("LinkedIn Headline Error:", error);
    res.status(500).json({ message: "Failed to generate headlines" });
  }
};

const optimizeAbout = async (req, res) => {
  try {
    const { rawText, coreFocus } = req.body;
    if (!rawText) return res.status(400).json({ message: "About text is required" });

    const optimized = await linkedinService.optimizeAboutSection(rawText, coreFocus || "");
    await deductLinkedInCredits(req.user._id);
    res.status(200).json({ optimized });
  } catch (error) {
    console.error("LinkedIn About Optimization Error:", error);
    res.status(500).json({ message: "Failed to optimize about section" });
  }
};

const createPost = async (req, res) => {
  try {
    const { topic, goal } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const post = await linkedinService.createLinkedInPost(topic, goal || "engagement");
    await deductLinkedInCredits(req.user._id);
    res.status(200).json({ post });
  } catch (error) {
    console.error("LinkedIn Post Error:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

module.exports = {
  analyzeProfile,
  generateHeadlines,
  optimizeAbout,
  createPost
};
