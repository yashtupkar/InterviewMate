const express = require("express");
const router = express.Router();
const multer = require("multer");
const customInterviewController = require("../controllers/customInterviewController");
const validateInterviewPayload = require("../middleware/validateInterviewPayload");
const { clerkAuth: userAuth } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF files are allowed."), false);
  },
});

// 1. Start Custom Session (Generation of Prompt & DB Entry)
router.post(
  "/start",
  userAuth,
  validateInterviewPayload,
  customInterviewController.startCustomSession,
);

// 2. Get Chat Response (LLM)
router.post("/chat", userAuth, customInterviewController.getChatResponse);

// 3. Save Transcript
router.post(
  "/save-transcript",
  userAuth,
  customInterviewController.saveTranscriptOnly,
);

// 4. Parse resume PDF for custom interview context
router.post(
  "/parse-resume",
  userAuth,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: `Upload error: ${err.message}` });
      }

      if (err) {
        return res
          .status(400)
          .json({ message: err.message || "File upload failed." });
      }

      return next();
    });
  },
  customInterviewController.parseResumePdf,
);

// 5. Interview Presets CRUD
router.get("/presets", userAuth, customInterviewController.listPresets);
router.post("/presets", userAuth, customInterviewController.createPreset);
router.put(
  "/presets/:presetId",
  userAuth,
  customInterviewController.updatePreset,
);
router.delete(
  "/presets/:presetId",
  userAuth,
  customInterviewController.deletePreset,
);

module.exports = router;
