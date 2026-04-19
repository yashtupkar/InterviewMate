const express = require("express");
const multer = require("multer");
const { clerkAuth, isAdmin } = require("../middleware/auth");
const {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} = require("../controllers/blogController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

router.get("/", getPublishedBlogs);

router.get("/admin/all", clerkAuth, isAdmin, getAdminBlogs);
router.post(
  "/admin/upload-image",
  clerkAuth,
  isAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }

      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      return next();
    });
  },
  uploadBlogImage,
);
router.post("/admin", clerkAuth, isAdmin, createBlog);
router.put("/admin/:id", clerkAuth, isAdmin, updateBlog);
router.delete("/admin/:id", clerkAuth, isAdmin, deleteBlog);

router.get("/:slug", getPublishedBlogBySlug);

module.exports = router;
