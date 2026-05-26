const express = require("express");
const proctoringRouter = express.Router();
const { getProctoringReport, saveProctoringReport } = require("../controllers/proctoringController");
const { clerkAuth } = require("../middleware/auth");

proctoringRouter.get("/report/:sessionId", clerkAuth, getProctoringReport);
proctoringRouter.post("/report/:sessionId", clerkAuth, saveProctoringReport);

module.exports = proctoringRouter;
