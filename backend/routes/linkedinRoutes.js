const express = require("express");
const router = express.Router();
const { clerkAuth } = require("../middleware/auth");
const {
  analyzeProfile,
  generateHeadlines,
  optimizeAbout,
  createPost
} = require("../controllers/linkedinController");

// All routes require authentication
router.post("/analyze", clerkAuth, analyzeProfile);
router.post("/generate-headlines", clerkAuth, generateHeadlines);
router.post("/optimize-about", clerkAuth, optimizeAbout);
router.post("/create-post", clerkAuth, createPost);

module.exports = router;
