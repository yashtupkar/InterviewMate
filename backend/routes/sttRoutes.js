const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const sttController = require("../controllers/sttController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("audio/")) {
      return cb(new Error("Only audio uploads are allowed."));
    }
    cb(null, true);
  },
});

const sttLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many transcription requests. Please try again shortly.",
  },
});

router.get("/health", sttController.health);
router.post("/transcribe", sttLimiter, upload.single("audio"), sttController.transcribe);

module.exports = router;
