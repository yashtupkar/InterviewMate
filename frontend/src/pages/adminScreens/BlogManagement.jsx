import React, { useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  markdownContent: "",
  category: "",
  tags: "",
  status: "draft",
  featuredImageUrl: "",
  featuredImageAlt: "",
  seoMetaTitle: "",
  seoMetaDescription: "",
  seoCanonicalUrl: "",
  seoOgImage: "",
};

const BlogManagement = () => {
  const { getToken } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const previewTitle = useMemo(
    () => form.title || "Untitled draft",
    [form.title],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${backendURL}/api/blogs/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });

      if (res.data?.success) {
        setBlogs(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error(error?.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (blog) => {
    setEditId(blog._id);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      markdownContent: blog.markdownContent || "",
      category: blog.category || "",
      tags: (blog.tags || []).join(", "),
      status: blog.status || "draft",
      featuredImageUrl: blog?.featuredImage?.url || "",
      featuredImageAlt: blog?.featuredImage?.alt || "",
      seoMetaTitle: blog?.seo?.metaTitle || "",
      seoMetaDescription: blog?.seo?.metaDescription || "",
      seoCanonicalUrl: blog?.seo?.canonicalUrl || "",
      seoOgImage: blog?.seo?.ogImage || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this blog? This is a soft delete and can be restored from database directly.",
    );
    if (!confirmed) return;

    try {
      const token = await getToken();
      await axios.delete(`${backendURL}/api/blogs/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blog deleted");
      if (editId === id) resetForm();
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error(error?.response?.data?.message || "Failed to delete blog");
    }
  };

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    markdownContent: form.markdownContent,
    category: form.category,
    tags: form.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: form.status,
    featuredImage: {
      url: form.featuredImageUrl,
      alt: form.featuredImageAlt,
    },
    seo: {
      metaTitle: form.seoMetaTitle,
      metaDescription: form.seoMetaDescription,
      canonicalUrl: form.seoCanonicalUrl,
      ogImage: form.seoOgImage,
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.markdownContent.trim()) {
      toast.error("Title and markdown content are required");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const payload = buildPayload();

      if (editId) {
        await axios.put(`${backendURL}/api/blogs/admin/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blog updated");
      } else {
        await axios.post(`${backendURL}/api/blogs/admin`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blog created");
      }

      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error("Failed to save blog:", error);
      toast.error(error?.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${backendURL}/api/blogs/admin/upload-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const uploadedUrl = res.data?.data?.url;
    if (!uploadedUrl) {
      throw new Error("Image upload failed");
    }

    return uploadedUrl;
  };

  const onFeaturedImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file);

      setForm((prev) => ({
        ...prev,
        featuredImageUrl: uploadedUrl,
        featuredImageAlt: prev.featuredImageAlt || file.name,
      }));

      toast.success("Featured image updated");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const onMarkdownImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file);

      setForm((prev) => {
        if (prev.markdownContent.includes(`(${uploadedUrl})`)) {
          return prev;
        }

        const markdownLine = `\n\n![${file.name}](${uploadedUrl})\n`;
        return {
          ...prev,
          markdownContent: `${prev.markdownContent || ""}${markdownLine}`,
        };
      });

      toast.success("Image inserted into markdown");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen text-white pt-24 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#bef264] font-bold">
              Admin
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Blog management
            </h1>
            <p className="text-zinc-400 mt-2">
              Create draft and published SEO-ready markdown blog posts.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchBlogs}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-white/10 bg-zinc-900/70 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg bg-[#bef264] text-black font-semibold inline-flex items-center gap-2"
            >
              <FiPlus /> New blog
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 space-y-4"
          >
            <h2 className="text-xl font-bold">
              {editId ? "Edit blog" : "Create blog"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Title"
                className="md:col-span-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              />
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="Slug (optional)"
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              />
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Category"
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              />
            </div>

            <textarea
              value={form.excerpt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Excerpt"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 min-h-[70px] outline-none focus:border-[#bef264]/60"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.tags}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="Tags (comma separated)"
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              />
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.featuredImageUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    featuredImageUrl: e.target.value,
                  }))
                }
                placeholder="Featured image URL"
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              />
              <input
                value={form.featuredImageAlt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    featuredImageAlt: e.target.value,
                  }))
                }
                placeholder="Featured image alt"
                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-zinc-900 cursor-pointer w-fit text-sm">
                {uploadingImage
                  ? "Uploading image..."
                  : "Upload featured image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFeaturedImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-zinc-900 cursor-pointer w-fit text-sm">
                {uploadingImage
                  ? "Uploading image..."
                  : "Upload image to markdown"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onMarkdownImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-zinc-500">
              Use featured upload for the blog hero image. Use markdown upload
              only when you want inline images inside the article.
            </p>

            <textarea
              value={form.markdownContent}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  markdownContent: e.target.value,
                }))
              }
              placeholder="Markdown content"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 min-h-[240px] font-mono text-sm outline-none focus:border-[#bef264]/60"
            />

            <details className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                SEO fields
              </summary>
              <div className="grid grid-cols-1 gap-3 mt-3">
                <input
                  value={form.seoMetaTitle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seoMetaTitle: e.target.value,
                    }))
                  }
                  placeholder="SEO meta title"
                  className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
                />
                <textarea
                  value={form.seoMetaDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seoMetaDescription: e.target.value,
                    }))
                  }
                  placeholder="SEO meta description"
                  className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 min-h-[70px] outline-none focus:border-[#bef264]/60"
                />
                <input
                  value={form.seoCanonicalUrl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seoCanonicalUrl: e.target.value,
                    }))
                  }
                  placeholder="Canonical URL"
                  className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
                />
                <input
                  value={form.seoOgImage}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seoOgImage: e.target.value }))
                  }
                  placeholder="OG image URL"
                  className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#bef264]/60"
                />
              </div>
            </details>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#bef264] text-black font-semibold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <FiSave />{" "}
                {saving ? "Saving..." : editId ? "Update blog" : "Create blog"}
              </button>
              {editId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-white/10"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>

          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
              <h3 className="text-lg font-bold inline-flex items-center gap-2">
                <FiEye /> Live markdown preview
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Preview exactly how your content will render on the blog page.
              </p>
              <div className="mt-4 border border-white/10 rounded-xl bg-black/40 p-4 max-h-[460px] overflow-auto prose prose-invert max-w-none prose-img:rounded-xl prose-img:border prose-img:border-white/10">
                <h1>{previewTitle}</h1>
                <ReactMarkdown>
                  {form.markdownContent ||
                    "Write markdown content to preview here..."}
                </ReactMarkdown>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5">
              <h3 className="text-lg font-bold">Existing blogs</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Use edit/delete controls to manage drafts and published posts.
              </p>

              {loading ? (
                <div className="py-8 flex items-center justify-center text-zinc-400">
                  Loading blogs...
                </div>
              ) : blogs.length === 0 ? (
                <div className="py-8 text-zinc-500">No blogs found.</div>
              ) : (
                <ul className="mt-4 space-y-2 max-h-[420px] overflow-auto">
                  {blogs.map((blog) => (
                    <li
                      key={blog._id}
                      className="border border-white/10 rounded-xl p-3 bg-zinc-900/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold line-clamp-1">
                            {blog.title}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            /{blog.slug} • {blog.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(blog)}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-white/10 inline-flex items-center gap-1"
                          >
                            <FiEdit2 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(blog._id)}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-300 inline-flex items-center gap-1"
                          >
                            <FiTrash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogManagement;
