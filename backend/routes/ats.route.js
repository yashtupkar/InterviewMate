const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scoreResume } = require('../controllers/ats.controller');
const clerkAuth = require('../middleware/auth');

// Use memory storage for multer since we just pass the buffer to pdf-parse
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Endpoint to score the resume with specialized multer error handling
router.post('/score', clerkAuth, (req, res, next) => {
    upload.single('resume')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. LIMIT_FILE_SIZE)
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading (e.g. fileFilter rejected it)
            return res.status(400).json({ success: false, message: err.message });
        }
        // Everything went fine, proceed to the controller
        next();
    });
}, scoreResume);

module.exports = router;
