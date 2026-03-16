const express = require("express");
const router = express.Router();
const clerkAuth = require("../middleware/auth");
const {
  startGDSession,
  openGDSession,
  getTopics,
  getNextAgentTurn,
  addUserMessage,
  addAgentMessage,
  generateGDReport,
  getGDReport,
  getUserGDs,
  concludeGDSession,
} = require("../controllers/gdController");

// Public
router.get("/topics", clerkAuth, getTopics);

// Session management
router.post("/start", clerkAuth, startGDSession);
router.post("/opening", clerkAuth, openGDSession);
router.post("/next-turn", clerkAuth, getNextAgentTurn);
router.post("/add-user-message", clerkAuth, addUserMessage);
router.post("/add-agent-message", clerkAuth, addAgentMessage);
router.post("/generate-report", clerkAuth, generateGDReport);
router.post("/conclude", clerkAuth, concludeGDSession);

// Reports
router.get("/report/:sessionId", clerkAuth, getGDReport);
router.get("/my-sessions", clerkAuth, getUserGDs);

module.exports = router;
