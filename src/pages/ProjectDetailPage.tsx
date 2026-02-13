import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Github, Globe } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
});

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Clear previous content
      ref.current.removeAttribute("data-processed");
      ref.current.innerHTML = chart;
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div key={chart} className="mermaid flex justify-center my-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto" ref={ref}>
      {chart}
    </div>
  );
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadme = async () => {
      setLoading(true);
      setError(null);

      const githubLink = location.state?.github;

      if (!githubLink || githubLink === "#") {
        setError("Repository URL not available for this project.");
        setLoading(false);
        return;
      }

      setRepoUrl(githubLink);

      try {
        const rawBase = githubLink.replace(
          "github.com",
          "raw.githubusercontent.com"
        );

        const branches = ["main", "master"];
        const filenames = ["README.md", "readme.md", "README", "Readme.md"];

        let found = false;
        let response;

        for (const br of branches) {
          for (const fn of filenames) {
            const url = `${rawBase}/${br}/${fn}`;
            response = await fetch(url);
            if (response.ok) {
              found = true;
              break;
            }
          }
          if (found) break;
        }

        if (!found || !response) {
          throw new Error(
            "README tidak ditemukan di branch main/master dengan variasi nama (README.md, readme.md, dll)."
          );
        }

        const text = await response.text();
        setContent(text);
      } catch (err: any) {
        setError(err.message || "Gagal memuat README.");
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, [location.state, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-gray-400">
          Memuat README dari GitHub...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Ops!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{error}</p>
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 mb-4"
          >
            <Github size={20} />
            Buka Repository di GitHub
          </a>
        )}
        <Link
          to="/projects"
          className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition"
        >
          <ArrowLeft size={18} />
          Kembali ke Proyek
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-24 pb-16 px-4 bg-white dark:bg-gray-950 transition-colors"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Proyek
          </Link>

          <div className="flex gap-4">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
              >
                <Github size={18} />
                View Source
              </a>
            )}
            {location.state?.demo && location.state.demo !== "#" && (
              <a
                href={location.state.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 transition"
              >
                <Globe size={18} />
                Visit Live Demo
              </a>
            )}
          </div>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-blue-500 prose-headings:scroll-mt-24 prose-table:w-full prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-700 prose-th:bg-gray-200 dark:prose-th:bg-gray-800 prose-th:p-2 prose-td:p-2 prose-td:border dark:prose-td:border-gray-700">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const lang = match ? match[1] : "";
                
                if (lang === "mermaid") {
                  return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                }
                
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </motion.div>
  );
}

