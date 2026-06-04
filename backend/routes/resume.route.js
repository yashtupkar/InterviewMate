const express = require("express");
const router = express.Router();
const {
  getAllResumes,
  getResumeById,
  saveResume,
  deleteResume,
  duplicateResume,
  rewriteResumeContent,
} = require("../controllers/resume.controller");

router.get("/:clerkId", getAllResumes);
router.get("/single/:id", getResumeById);
router.post("/save", saveResume);
router.post("/duplicate/:id", duplicateResume);
router.post("/rewrite/:id", rewriteResumeContent);
router.delete("/:id", deleteResume);

module.exports = router;
