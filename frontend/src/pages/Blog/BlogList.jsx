import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { FiArrowRight, FiCalendar, FiClock, FiTag } from "react-icons/fi";
import GoogleAdsBlock from "../../components/common/GoogleAdsBlock";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || "1");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  const page = useMemo(
    () => (Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl),
    [pageFromUrl],
  );

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendURL}/api/blogs`, {
          params: { page, limit: 9 },
        });

        if (res.data?.success) {
          setBlogs(res.data.data || []);
          setMeta({
            currentPage: res.data.currentPage || 1,
            totalPages: res.data.totalPages || 1,
            total: res.data.total || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page]);

  const onPageChange = (nextPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
  };

  const canonicalUrl = `${window.location.origin}/blog`;

  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-4 md:px-8">
      <Helmet>
        <title>
          InterviewMate Blog | Interview Tips, Career Guides, and ATS Insights
        </title>
        <meta
          name="description"
          content="Read InterviewMate blogs on interview preparation, resume optimization, ATS strategies, and job-winning communication techniques."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="InterviewMate Blog" />
        <meta
          property="og:description"
          content="Interview tips, career guides, and practical strategies to prepare better."
        />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-10">
        <section className="space-y-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#bef264] font-bold">
            Knowledge Hub
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Blog resources for better interview outcomes
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Tactical breakdowns on interviews, resume strategy, and career
            growth. Updated regularly with practical and testable advice.
          </p>
        </section>

        {loading ? (
          <div className="min-h-[220px] flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-white/15 border-t-[#bef264] animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="min-h-[220px] border border-white/10 rounded-2xl bg-black/30 flex items-center justify-center text-zinc-400">
            No blogs published yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden hover:border-[#bef264]/50 transition-colors"
                >
                  {blog?.featuredImage?.url ? (
                    <img
                      src={blog.featuredImage.url}
                      alt={blog?.featuredImage?.alt || blog.title}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
                  )}

                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-bold leading-tight line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-zinc-400 text-sm line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <FiCalendar size={13} /> {formatDate(blog.publishedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FiClock size={13} /> {blog.readTimeMinutes || 1} min
                        read
                      </span>
                      {blog?.category ? (
                        <span className="inline-flex items-center gap-1.5">
                          <FiTag size={13} /> {blog.category}
                        </span>
                      ) : null}
                    </div>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-2 text-[#bef264] font-semibold hover:text-white transition-colors"
                    >
                      Read article <FiArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-zinc-500">{meta.total} articles</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(meta.currentPage - 1)}
                  disabled={meta.currentPage <= 1}
                  className="px-3 py-2 rounded-lg border border-white/10 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-400">
                  Page {meta.currentPage} of {meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange(meta.currentPage + 1)}
                  disabled={meta.currentPage >= meta.totalPages}
                  className="px-3 py-2 rounded-lg border border-white/10 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        <GoogleAdsBlock className="mt-8" />
      </div>
    </div>
  );
};

export default BlogList;
