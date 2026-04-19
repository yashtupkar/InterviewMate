const Blog = require("../models/Blog");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImageBuffer } = require("../services/cloudinaryService");

const MAX_LIMIT = 50;

const sanitizeText = (value = "") => String(value).replace(/\s+/g, " ").trim();

const sanitizeMarkdown = (value = "") =>
  String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .trim();

const stripMarkdown = (value = "") =>
  String(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const calculateReadTime = (markdown = "") => {
  const words = stripMarkdown(markdown).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const makeSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

const ensureUniqueSlug = async (candidate, excludeId = null) => {
  const base = makeSlug(candidate) || `blog-${Date.now()}`;
  let slug = base;
  let attempt = 1;

  while (true) {
    if (attempt > 10) {
      throw new ApiError(500, "Failed to generate unique slug");
    }

    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const exists = await Blog.exists(query);
    if (!exists) return slug;

    attempt += 1;
    slug = `${base}-${attempt}`;
  }
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return [
    ...new Set(tags.map((t) => sanitizeText(t).toLowerCase()).filter(Boolean)),
  ];
};

const getAuthorName = (user) => {
  const fullName = sanitizeText(
    `${user?.firstName || ""} ${user?.lastName || ""}`,
  );
  return fullName || user?.email || "InterviewMate Team";
};

const buildPublicBlogQuery = () => ({
  isActive: true,
  status: "published",
  publishedAt: { $lte: new Date() },
});

const parsePaging = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || 10),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const escapeXml = (unsafe = "") =>
  String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildWritePayload = (body) => {
  const title = sanitizeText(body.title || "");
  const markdownContent = sanitizeMarkdown(body.markdownContent || "");
  const excerptFromContent = stripMarkdown(markdownContent).slice(0, 220);

  return {
    title,
    excerpt: sanitizeText(body.excerpt || excerptFromContent),
    markdownContent,
    featuredImage: {
      url: sanitizeText(body?.featuredImage?.url || ""),
      alt: sanitizeText(body?.featuredImage?.alt || title),
    },
    tags: normalizeTags(body.tags),
    category: sanitizeText(body.category || "").toLowerCase(),
    status: body.status === "published" ? "published" : "draft",
    seo: {
      metaTitle: sanitizeText(body?.seo?.metaTitle || title),
      metaDescription: sanitizeText(
        body?.seo?.metaDescription || excerptFromContent,
      ),
      canonicalUrl: sanitizeText(body?.seo?.canonicalUrl || ""),
      ogImage: sanitizeText(
        body?.seo?.ogImage || body?.featuredImage?.url || "",
      ),
    },
    readTimeMinutes: calculateReadTime(markdownContent),
  };
};

// @desc    Public list of published blogs
// @route   GET /api/blogs
// @access  Public
const getPublishedBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const query = buildPublicBlogQuery();

  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: "i" };
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { tags: searchRegex },
    ];
  }

  if (req.query.tag) {
    query.tags = sanitizeText(req.query.tag).toLowerCase();
  }

  if (req.query.category) {
    query.category = sanitizeText(req.query.category).toLowerCase();
  }

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .select(
        "title slug excerpt featuredImage tags category authorName publishedAt readTimeMinutes seo",
      )
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: blogs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: blogs,
  });
});

// @desc    Public blog detail by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getPublishedBlogBySlug = asyncHandler(async (req, res) => {
  const slug = sanitizeText(req.params.slug).toLowerCase();
  const blog = await Blog.findOne({ ...buildPublicBlogQuery(), slug }).lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Admin list of blogs (draft + published)
// @route   GET /api/blogs/admin/all
// @access  Admin
const getAdminBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const query = { isActive: true };

  if (req.query.status === "draft" || req.query.status === "published") {
    query.status = req.query.status;
  }

  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: "i" };
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { tags: searchRegex },
    ];
  }

  const [blogs, total] = await Promise.all([
    Blog.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: blogs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: blogs,
  });
});

// @desc    Create blog
// @route   POST /api/blogs/admin
// @access  Admin
const createBlog = asyncHandler(async (req, res) => {
  const payload = buildWritePayload(req.body);

  if (!payload.title) {
    throw new ApiError(400, "Title is required");
  }

  if (!payload.markdownContent) {
    throw new ApiError(400, "Markdown content is required");
  }

  const slugSource = sanitizeText(req.body.slug || payload.title);
  const slug = await ensureUniqueSlug(slugSource);
  const publishNow = payload.status === "published";

  const blog = await Blog.create({
    ...payload,
    slug,
    authorName: getAuthorName(req.user),
    publishedAt: publishNow ? new Date() : null,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

// @desc    Update blog
// @route   PUT /api/blogs/admin/:id
// @access  Admin
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, isActive: true });

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  const payload = buildWritePayload({ ...blog.toObject(), ...req.body });

  if (!payload.title) {
    throw new ApiError(400, "Title is required");
  }

  if (!payload.markdownContent) {
    throw new ApiError(400, "Markdown content is required");
  }

  const requestedSlug = sanitizeText(req.body.slug || payload.title);
  const nextSlug = await ensureUniqueSlug(requestedSlug, blog._id);
  const nextStatus = payload.status;

  blog.title = payload.title;
  blog.slug = nextSlug;
  blog.excerpt = payload.excerpt;
  blog.markdownContent = payload.markdownContent;
  blog.featuredImage = payload.featuredImage;
  blog.tags = payload.tags;
  blog.category = payload.category;
  blog.status = nextStatus;
  blog.seo = payload.seo;
  blog.readTimeMinutes = payload.readTimeMinutes;
  blog.updatedBy = req.user._id;

  if (nextStatus === "published" && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }

  if (nextStatus === "draft") {
    blog.publishedAt = null;
  }

  await blog.save();

  res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});

// @desc    Soft delete blog
// @route   DELETE /api/blogs/admin/:id
// @access  Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, isActive: true });

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  blog.isActive = false;
  blog.updatedBy = req.user._id;
  await blog.save();

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

// @desc    Upload blog image to Cloudinary
// @route   POST /api/blogs/admin/upload-image
// @access  Admin
const uploadBlogImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const uploaded = await uploadImageBuffer({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    folder: "interviewmate/blogs",
  });

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: uploaded,
  });
});

// @desc    Dynamic XML sitemap
// @route   GET /sitemap.xml
// @access  Public
const getSitemapXml = asyncHandler(async (req, res) => {
  const siteBaseUrl = sanitizeText(
    process.env.FRONTEND_URL ||
      process.env.APP_BASE_URL ||
      "http://localhost:5173",
  ).replace(/\/+$/, "");

  const staticPaths = [
    "/",
    "/about",
    "/contact",
    "/interview-questions",
    "/blog",
  ];
  const staticEntries = staticPaths.map((path) => ({
    loc: `${siteBaseUrl}${path}`,
    lastmod: new Date().toISOString(),
  }));

  const blogs = await Blog.find(buildPublicBlogQuery())
    .select("slug publishedAt updatedAt")
    .sort({ publishedAt: -1 })
    .lean();

  const blogEntries = blogs.map((blog) => ({
    loc: `${siteBaseUrl}/blog/${blog.slug}`,
    lastmod: (blog.updatedAt || blog.publishedAt || new Date()).toISOString(),
  }));

  const urls = [...staticEntries, ...blogEntries]
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

module.exports = {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
  getSitemapXml,
};
