const express = require('express');
const router = express.Router();
const { clerkAuth, isAdmin } = require('../middleware/auth');
const { 
  getQuestions, 
  getQuestionById, 
  getFiltersMetadata, 
  getAggregatedStats,
  bulkUploadQuestions 
} = require('../controllers/questionController');

// Admin route
router.post('/admin/bulk-upload', clerkAuth, isAdmin, bulkUploadQuestions);

// Define specific routes first (otherwise /filters/metadata matches /:id)
router.get('/stats/aggregates', getAggregatedStats);
router.get('/filters/metadata', getFiltersMetadata);

router.route('/')
  .get(getQuestions);

router.route('/:id')
  .get(getQuestionById);

module.exports = router;
