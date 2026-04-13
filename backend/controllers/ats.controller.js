const pdfParse = require("pdf-parse");
const AtsScore = require("../models/AtsScore");
const { scoreResumeWithAI } = require("../services/atsService");
const ApiError = require("../utils/ApiError");
const { SERVICE_CREDITS } = require("../config/pricingConfig");
const CreditService = require("../services/creditService");
const { rewardReferrer } = require("./referralController");

exports.scoreResume = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const clerkId = req.user?.clerkId;
    const { jobDescription } = req.body;
    const file = req.file;

    if (!file) {
      return next(new ApiError(400, "Resume PDF file is required."));
    }
    if (!jobDescription) {
      return next(new ApiError(400, "Job Description is required."));
    }

    // 1. Parse PDF text
    let resumeText = "";
    try {
      const pdfData = await pdfParse(file.buffer);
      resumeText = pdfData.text;
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      return next(
        new ApiError(
          400,
          "Failed to parse the uploaded PDF file. Please ensure it is a valid PDF.",
        ),
      );
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return next(
        new ApiError(400, "No text could be extracted from the PDF."),
      );
    }

    // 1.5 Deduct credits from the authenticated user account.
    if (userId) {
      try {
        const deduction = await CreditService.deduct(userId, "ats_scanner");
        if (!deduction.success) {
          return next(
            new ApiError(
              402,
              deduction.message ||
                `Insufficient credits. ${SERVICE_CREDITS.ats_scanner} credits required.`,
            ),
          );
        }
      } catch (error) {
        return next(new ApiError(error.statusCode || 400, error.message));
      }
    }

    // 2. Analyze with AI (OpenRouter)
    const analysisResult = await scoreResumeWithAI(resumeText, jobDescription);

    // 3. Save to database (if clerkId is provided)
    let savedDisplayData = { ...analysisResult };
    if (clerkId) {
      const newScore = await AtsScore.create({
        clerkId,
        jobDescription,
        resumeFileName: file.originalname,
        score: analysisResult.score,
        categories: analysisResult.categories,
      });
      savedDisplayData.id = newScore._id;

      // Trigger referral reward in background (after first ATS scan)
      if (userId) {
        rewardReferrer(userId).catch((err) =>
          console.error("Background: Error rewarding referrer:", err),
        );
      }
    }

    // 4. Return result
    return res.status(200).json({
      success: true,
      data: savedDisplayData,
    });
  } catch (error) {
    console.error("ATS Score Controller Error:", error);
    return next(
      new ApiError(
        500,
        error.message || "An error occurred while scoring the resume.",
      ),
    );
  }
};
