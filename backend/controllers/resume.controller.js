const Resume = require("../models/Resume");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const {
  TIER_LIMITS,
  RESUME_AI_REWRITE_CONFIG,
} = require("../config/pricingConfig");
const {
  rewriteResumeText,
  rewriteFullResumeData,
} = require("../services/resumeRewriteService");
const CreditService = require("../services/creditService");

exports.getAllResumes = async (req, res, next) => {
  try {
    const clerkId = req.params.clerkId;
    if (!clerkId) {
      return next(new ApiError(400, "Clerk ID is required."));
    }

    const resumes = await Resume.find({ clerkId })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.error("Get All Resumes Error:", error);
    return next(new ApiError(500, "Failed to fetch resumes."));
  }
};

exports.getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
      return next(new ApiError(404, "Resume not found."));
    }

    return res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get Resume By ID Error:", error);
    return next(new ApiError(500, "Failed to fetch resume."));
  }
};

exports.saveResume = async (req, res, next) => {
  try {
    const { clerkId, _id } = req.body;
    if (!clerkId) {
      return next(new ApiError(400, "Clerk ID is required to save resume."));
    }

    const updateData = { ...req.body };
    delete updateData._id; // Remove _id if it's there to prevent updating it

    // Ensure profiles are handled correctly
    if (updateData.profiles) {
      updateData.profiles = updateData.profiles.map((p) => {
        const newProfile = { ...p };
        if (!newProfile._id) {
          newProfile._id = new mongoose.Types.ObjectId();
        }
        return newProfile;
      });
    }

    let resume;
    if (_id) {
      // Update existing resume
      resume = await Resume.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { returnDocument: "after", runValidators: true, context: "query" },
      );
    } else {
      // Create new resume - Check Limit First
      const user = await User.findOne({ clerkId }).populate("subscription");
      if (!user) return next(new ApiError(404, "User not found."));

      const tier = user.subscription?.tier || "Free";
      const limit = TIER_LIMITS[tier]?.resumeLimit || 1;

      const count = await Resume.countDocuments({ clerkId });
      if (count >= limit) {
        return next(
          new ApiError(
            400,
            `Resume limit reached for ${tier} tier (${limit}). Please upgrade for more.`,
          ),
        );
      }

      resume = await Resume.create({ clerkId, ...updateData });
    }

    return res.status(200).json({
      success: true,
      message: "Resume saved successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Save Resume Error:", error);
    return next(new ApiError(500, "Failed to save resume data."));
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByIdAndDelete(id);

    if (!resume) {
      return next(new ApiError(404, "Resume not found."));
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete Resume Error:", error);
    return next(new ApiError(500, "Failed to delete resume."));
  }
};

exports.duplicateResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clerkId, title } = req.body;

    if (!id) {
      return next(new ApiError(400, "Source resume ID is required."));
    }

    if (!clerkId) {
      return next(new ApiError(400, "Clerk ID is required."));
    }

    const sourceResume = await Resume.findById(id).lean();
    if (!sourceResume) {
      return next(new ApiError(404, "Source resume not found."));
    }

    if (sourceResume.clerkId !== clerkId) {
      return next(
        new ApiError(403, "You are not allowed to duplicate this resume."),
      );
    }

    const user = await User.findOne({ clerkId }).populate("subscription");
    if (!user) {
      return next(new ApiError(404, "User not found."));
    }

    const tier = user.subscription?.tier || "Free";
    if (tier === "Free") {
      return next(
        new ApiError(
          403,
          "Resume duplication is available on paid plans. Please upgrade to continue.",
        ),
      );
    }

    const limit = TIER_LIMITS[tier]?.resumeLimit || 1;
    const currentCount = await Resume.countDocuments({ clerkId });
    if (currentCount >= limit) {
      return next(
        new ApiError(
          400,
          `Resume limit reached for ${tier} tier (${limit}). Please upgrade for more.`,
        ),
      );
    }

    const duplicatePayload = { ...sourceResume };
    delete duplicatePayload._id;
    delete duplicatePayload.__v;
    delete duplicatePayload.createdAt;
    delete duplicatePayload.updatedAt;

    const baseTitle =
      typeof sourceResume.title === "string" && sourceResume.title.trim()
        ? sourceResume.title.trim()
        : "Untitled Resume";
    const requestedTitle =
      typeof title === "string" && title.trim()
        ? title.trim()
        : `${baseTitle} (Copy)`;

    const duplicatedResume = await Resume.create({
      ...duplicatePayload,
      clerkId,
      title: requestedTitle,
    });

    return res.status(201).json({
      success: true,
      message: "Resume duplicated successfully.",
      data: duplicatedResume,
    });
  } catch (error) {
    console.error("Duplicate Resume Error:", error);
    return next(new ApiError(500, "Failed to duplicate resume."));
  }
};

exports.rewriteResumeContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      clerkId,
      mode = "section",
      target = "summary",
      content = "",
      resumeData,
      jobDescription = "",
    } = req.body;

    if (!id) {
      return next(new ApiError(400, "Resume ID is required."));
    }

    if (!clerkId) {
      return next(new ApiError(400, "Clerk ID is required."));
    }

    if (!RESUME_AI_REWRITE_CONFIG.enabled) {
      return next(new ApiError(403, "AI rewrite is currently disabled."));
    }

    const isFullMode = mode === "full";

    if (!isFullMode && (!content || !String(content).trim())) {
      return next(new ApiError(400, "Content is required for AI rewrite."));
    }

    const resume = await Resume.findById(id).lean();
    if (!resume) {
      return next(new ApiError(404, "Resume not found."));
    }

    if (resume.clerkId !== clerkId) {
      return next(
        new ApiError(403, "You are not allowed to rewrite this resume."),
      );
    }

    const user = await User.findOne({ clerkId }).populate("subscription");
    if (!user || !user.subscription) {
      return next(new ApiError(404, "User subscription not found."));
    }

    const tier = user.subscription.tier || "Free";
    const allowedTiers = isFullMode
      ? RESUME_AI_REWRITE_CONFIG.fullRewriteTiers
      : RESUME_AI_REWRITE_CONFIG.sectionRewriteTiers;

    if (!allowedTiers.includes(tier)) {
      return res.status(403).json({
        success: false,
        code: "FEATURE_NOT_AVAILABLE",
        message: isFullMode
          ? "Full resume rewrite is available on higher plans."
          : "AI rewrite is available on paid plans.",
        tier,
        requiredTiers: allowedTiers,
      });
    }

    const creditCost = isFullMode
      ? RESUME_AI_REWRITE_CONFIG.fullRewriteCost
      : RESUME_AI_REWRITE_CONFIG.sectionRewriteCost;

    const deduction = await CreditService.deduct(
      user._id,
      isFullMode ? "resume_full_rewrite" : "resume_section_rewrite",
      creditCost,
    );

    if (!deduction.success) {
      return res.status(402).json({
        success: false,
        code: "INSUFFICIENT_CREDITS",
        message:
          deduction.message ||
          `Insufficient credits. ${creditCost} credits required.`,
        needed: creditCost,
        available: deduction.available,
      });
    }

    const rewriteMetadata = {
      jobTitle: resume?.personalInfo?.jobTitle,
      jobDescription:
        typeof jobDescription === "string" ? jobDescription.trim() : "",
      skills: (resume?.skills || []).flatMap((item) => {
        if (!item) return [];
        if (typeof item.subSkills === "string") {
          return item.subSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
        }
        return [];
      }),
    };

    const rewriteResult = isFullMode
      ? await rewriteFullResumeData({
          resumeData:
            resumeData && typeof resumeData === "object" ? resumeData : resume,
          metadata: rewriteMetadata,
        })
      : await rewriteResumeText({
          mode: "section",
          target,
          content: String(content),
          metadata: rewriteMetadata,
        });

    return res.status(200).json({
      success: true,
      message: "Content rewritten successfully.",
      data: {
        mode: isFullMode ? "full" : "section",
        target,
        rewritten: rewriteResult.rewritten || "",
        rewrittenResume: rewriteResult.rewrittenResume || null,
        keywordSuggestions: rewriteResult.keywordSuggestions || [],
        missingSkills: rewriteResult.missingSkills || [],
        jdInsights: rewriteResult.jdInsights || null,
        tips: rewriteResult.tips,
      },
      credits: {
        deducted: deduction.amount,
        remaining: deduction.remaining,
        topupRemaining: deduction.topupRemaining,
      },
    });
  } catch (error) {
    console.error("Rewrite Resume Content Error:", error);
    return next(new ApiError(500, "Failed to rewrite content."));
  }
};
