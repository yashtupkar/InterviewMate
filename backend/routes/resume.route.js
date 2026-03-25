const express = require('express');
const router = express.Router();
const { getAllResumes, getResumeById, saveResume, deleteResume } = require('../controllers/resume.controller');

router.get('/:clerkId', getAllResumes);
router.get('/single/:id', getResumeById);
router.post('/save', saveResume);
router.delete('/:id', deleteResume);

module.exports = router;
