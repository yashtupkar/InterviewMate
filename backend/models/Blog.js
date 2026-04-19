const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 320,
    },
    markdownContent: {
      type: String,
      required: true,
      trim: true,
    },
    featuredImage: {
      url: {
        type: String,
        trim: true,
      },
      alt: {
        type: String,
        trim: true,
        maxlength: 140,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    authorName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    readTimeMinutes: {
      type: Number,
      default: 1,
      min: 1,
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 180,
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 300,
      },
      canonicalUrl: {
        type: String,
        trim: true,
      },
      ogImage: {
        type: String,
        trim: true,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model("Blog", blogSchema);
