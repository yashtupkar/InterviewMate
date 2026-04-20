import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Helmet } from "react-helmet-async";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiTag,
  FiUser,
} from "react-icons/fi";
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

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moreBlogs, setMoreBlogs] = useState([]);
  const [loadingMoreBlogs, setLoadingMoreBlogs] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await axios.get(`${backendURL}/api/blogs/${slug}`);
        if (res.data?.success) {
          setBlog(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load blog details:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const fetchMoreBlogs = async () => {
      if (!blog?.slug) return;

      setLoadingMoreBlogs(true);
      try {
        const primaryParams = { page: 1, limit: 6 };
        if (blog?.category) {
          primaryParams.category = blog.category;
        }

        const primaryRes = await axios.get(`${backendURL}/api/blogs`, {
          params: primaryParams,
        });

        const primaryList = (primaryRes.data?.data || [])
          .filter((item) => item.slug !== blog.slug)
          .slice(0, 3);

        if (primaryList.length === 3) {
          setMoreBlogs(primaryList);
          return;
        }

        const fallbackRes = await axios.get(`${backendURL}/api/blogs`, {
          params: { page: 1, limit: 9 },
        });

        const fallbackList = (fallbackRes.data?.data || []).filter(
          (item) =>
            item.slug !== blog.slug &&
            !primaryList.some((existing) => existing.slug === item.slug),
        );

        setMoreBlogs([...primaryList, ...fallbackList].slice(0, 3));
      } catch (error) {
        console.error("Failed to load more blogs:", error);
        setMoreBlogs([]);
      } finally {
        setLoadingMoreBlogs(false);
      }
    };

    fetchMoreBlogs();
  }, [blog?.slug, blog?.category]);

  const canonicalUrl = useMemo(() => {
    if (!blog?.slug) return `${window.location.origin}/blog`;
    return (
      blog?.seo?.canonicalUrl || `${window.location.origin}/blog/${blog.slug}`
    );
  }, [blog]);

  const articleSchema = useMemo(() => {
    if (!blog) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog.title,
      description: blog?.seo?.metaDescription || blog.excerpt,
      image: blog?.seo?.ogImage || blog?.featuredImage?.url || undefined,
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt || blog.publishedAt,
      author: {
        "@type": "Person",
        name: blog.authorName || "InterviewMate Team",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    };
  }, [blog, canonicalUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white pt-24">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-[#bef264] animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen pt-24 px-4 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black">Blog not found</h1>
          <Link
            to="/blog"
            className="text-[#bef264] hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-24 pb-24 px-4 md:px-8">
      <Helmet>
        <title>
          {blog?.seo?.metaTitle || `${blog.title} | InterviewMate Blog`}
        </title>
        <meta
          name="description"
          content={
            blog?.seo?.metaDescription ||
            blog.excerpt ||
            "InterviewMate blog article"
          }
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={blog?.seo?.metaTitle || blog.title}
        />
        <meta
          property="og:description"
          content={
            blog?.seo?.metaDescription ||
            blog.excerpt ||
            "InterviewMate blog article"
          }
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={blog?.seo?.ogImage || blog?.featuredImage?.url || ""}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={blog?.seo?.metaTitle || blog.title}
        />
        <meta
          name="twitter:description"
          content={
            blog?.seo?.metaDescription ||
            blog.excerpt ||
            "InterviewMate blog article"
          }
        />
        <meta
          name="twitter:image"
          content={blog?.seo?.ogImage || blog?.featuredImage?.url || ""}
        />
        {articleSchema ? (
          <script type="application/ld+json">
            {JSON.stringify(articleSchema)}
          </script>
        ) : null}
      </Helmet>

      <article className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#bef264] transition-colors"
        >
          <FiArrowLeft size={14} /> Back to blog
        </Link>

        <header className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {blog.title}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <FiUser size={13} /> {blog.authorName || "InterviewMate Team"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar size={13} /> {formatDate(blog.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock size={13} /> {blog.readTimeMinutes || 1} min read
            </span>
          </div>
        </header>

        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-200 prose-a:text-[#bef264] prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-table:border-collapse prose-table:border prose-table:border-white/20 prose-th:bg-zinc-900 prose-th:text-white prose-th:border prose-th:border-white/20 prose-td:border prose-td:border-white/20 prose-td:p-2">
          {blog?.featuredImage?.url && (
            <img
              src={blog.featuredImage.url}
              alt={blog?.featuredImage?.alt || blog.title}
              className="rounded-2xl border border-white/10 w-full h-auto object-contain mb-6"
              loading="eager"
            />
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ ...props }) => (
                <img
                  {...props}
                  className="rounded-xl border border-white/10 w-full h-auto object-contain"
                  loading="lazy"
                />
              ),
              a: ({ ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#bef264] underline"
                />
              ),
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code
                    {...props}
                    className="bg-zinc-900 px-1.5 py-0.5 rounded-md text-sm"
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    {...props}
                    className="block bg-zinc-950 border border-white/10 p-4 rounded-xl overflow-x-auto text-sm"
                  >
                    {children}
                  </code>
                ),
              table: ({ children }) => (
                <table className="w-full border-collapse border border-white/20 rounded-lg overflow-hidden my-4">
                  {children}
                </table>
              ),
              thead: ({ children }) => (
                <thead className="bg-zinc-900">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-white/10">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="divide-x divide-white/10">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="bg-zinc-900 px-4 py-2 text-left font-bold border border-white/20">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 border border-white/20">{children}</td>
              ),
              h1: ({ children }) => (
                <h1 className="text-3xl font-black mt-6 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-5 mb-3 text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold mt-4 mb-2 text-white">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-bold mt-3 mb-2">{children}</h4>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 ml-2 my-3">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 ml-2 my-3">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-zinc-200">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#bef264] pl-4 italic text-zinc-300 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {blog.markdownContent || ""}
          </ReactMarkdown>
        </div>

        <GoogleAdsBlock className="mt-10" />

        <section className="pt-3">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-black tracking-tight">More blogs</h2>
            <Link
              to="/blog"
              className="text-sm text-[#bef264] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              View all <FiArrowRight size={14} />
            </Link>
          </div>

          {loadingMoreBlogs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden animate-pulse"
                >
                  <div className="h-36 w-full bg-zinc-800/70" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-10/12 rounded bg-zinc-800/70" />
                    <div className="h-4 w-7/12 rounded bg-zinc-800/60" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : moreBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreBlogs.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden hover:border-[#bef264]/50 transition-colors"
                >
                  {item?.featuredImage?.url ? (
                    <img
                      src={item.featuredImage.url}
                      alt={item?.featuredImage?.alt || item.title}
                      className="h-36 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-36 w-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
                  )}

                  <div className="p-4 space-y-3">
                    <h3 className="text-base font-bold leading-tight line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <FiCalendar size={12} /> {formatDate(item.publishedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FiClock size={12} /> {item.readTimeMinutes || 1} min
                      </span>
                      {item?.category ? (
                        <span className="inline-flex items-center gap-1.5">
                          <FiTag size={12} /> {item.category}
                        </span>
                      ) : null}
                    </div>

                    <Link
                      to={`/blog/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-[#bef264] text-sm font-semibold hover:text-white transition-colors"
                    >
                      Read article <FiArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/30 text-zinc-400 px-4 py-6 text-sm">
              More blogs will appear here as you publish them.
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default BlogDetail;
