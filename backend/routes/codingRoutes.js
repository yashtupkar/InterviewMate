const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');

router.post('/execute', codingController.executeCode);

module.exports = router;
