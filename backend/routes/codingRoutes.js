const express = require("express");
const router = express.Router();
const codingController = require("../controllers/codingController");
const { clerkAuth } = require("../middleware/auth");
const { aiRateLimiter } = require("../middleware/rateLimiters");

router.post("/execute", clerkAuth, aiRateLimiter, codingController.executeCode);

module.exports = router;
