const express = require("express");
const { clerkAuth, isAdmin } = require("../middleware/auth");
const {
  getPreferences,
  listDiscoverUsers,
  upsertPreferences,
  sendRequest,
  listRequests,
  respondToRequest,
  joinAcceptedRequest,
  getSession,
  getLiveKitToken,
  blockUser,
  reportUser,
  joinInstantQueue,
  leaveInstantQueue,
  getQueueStatus,
  startSession,
  endSession,
  getAdminReports,
  updateAdminReport,
} = require("../controllers/peerInterviewController");

const router = express.Router();

router.get("/preferences", clerkAuth, getPreferences);
router.post("/preferences", clerkAuth, upsertPreferences);
router.get("/users", clerkAuth, listDiscoverUsers);

router.post("/request", clerkAuth, sendRequest);
router.get("/requests", clerkAuth, listRequests);
router.post("/request/:requestId/respond", clerkAuth, respondToRequest);
router.post("/request/:requestId/join", clerkAuth, joinAcceptedRequest);

router.post("/queue/join", clerkAuth, joinInstantQueue);
router.post("/queue/leave", clerkAuth, leaveInstantQueue);
router.get("/queue/status", clerkAuth, getQueueStatus);

router.get("/session/:sessionId", clerkAuth, getSession);
router.post("/session/:sessionId/token", clerkAuth, getLiveKitToken);
router.post("/session/:sessionId/start", clerkAuth, startSession);
router.post("/session/:sessionId/end", clerkAuth, endSession);

router.post("/block/:userId", clerkAuth, blockUser);
router.post("/report", clerkAuth, reportUser);

router.get("/admin/reports", clerkAuth, isAdmin, getAdminReports);
router.patch("/admin/reports/:reportId", clerkAuth, isAdmin, updateAdminReport);

module.exports = router;
