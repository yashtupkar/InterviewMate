const Resume = require("../models/Resume");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

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
      // Create new resume
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
