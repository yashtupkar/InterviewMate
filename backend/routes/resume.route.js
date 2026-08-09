const express = require('express');
const router = express.Router();
const { getAllResumes, getResumeById, saveResume, deleteResume } = require('../controllers/resume.controller');
const { aiRateLimiter } = require("../middleware/rateLimiters");

router.get('/:clerkId', getAllResumes);
router.get('/single/:id', getResumeById);
router.post('/save', aiRateLimiter, saveResume);
router.delete('/:id', deleteResume);

module.exports = router;
