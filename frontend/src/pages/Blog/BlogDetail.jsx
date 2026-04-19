import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiCalendar, FiClock, FiUser } from "react-icons/fi";
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
      </article>
    </div>
  );
};

export default BlogDetail;
