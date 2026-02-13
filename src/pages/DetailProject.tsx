import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clipboard, CheckCircle, X, Menu } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { dracula } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Define types for notebook content and titles
type NotebookContent = {
  id: string;
  type: "markdown" | "code";
  content: string;
};

type Title = {
  text: string;
  id: string;
  level: "h1" | "h2" | "h3";
};

const DetailProject: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notebookContent, setNotebookContent] = useState<NotebookContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [titles, setTitles] = useState<Title[]>([]); // Sidebar titles
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // Index of copied code block

  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/NestiaDev-id/Python/refs/heads/main/Praktikum5/Latihan5.ipynb"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data from GitHub");
        }

        const data = await response.json();
        const cells = data.cells;

        const extractedTitles: Title[] = [];
        const processedContent: NotebookContent[] = [];

        cells.forEach((cell: any, index: number) => {
          if (cell.cell_type === "markdown") {
            const markdownContent = cell.source.join("\n").trim();
            markdownContent.split("\n").forEach((line: string, i: number) => {
              if (
                line.startsWith("# ") ||
                line.startsWith("## ") ||
                line.startsWith("### ")
              ) {
                const level: "h1" | "h2" | "h3" = line.startsWith("# ")
                  ? "h1"
                  : line.startsWith("## ")
                  ? "h2"
                  : "h3";
                const id: string = `title-${index}-${i}`;
                const title: Title = {
                  text: line.replace(/^#+ /, ""),
                  id,
                  level,
                };
                extractedTitles.push(title);
              }
            });

            processedContent.push({
              type: "markdown",
              content: markdownContent,
              id: `md-${index}`,
            });
          } else if (cell.cell_type === "code") {
            processedContent.push({
              type: "code",
              content: cell.source.join(""),
              id: `code-${index}`,
            });
          }
        });

        setNotebookContent(processedContent);
        setTitles(extractedTitles);
      } catch (error: any) {
        setError(error.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNotebook();
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scrollToTitle = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex min-h-screen mt-16 p-4 bg-gray-900 text-gray-200">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} className="text-white" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 min-h-screen w-64 bg-gray-800 p-6 shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <button
          className="lg:hidden absolute top-4 right-4 text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">NestiaDev</h2>
        <nav className="space-y-2">
          <Link to="#" className="block text-gray-300 hover:text-white">
            Wajib BACA!
          </Link>
          <Link to="#" className="block text-blue-400 font-semibold">
            Login Dengan Social
          </Link>
          <Link to="#" className="block text-gray-300 hover:text-white">
            Daftar Menggunakan Email
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto overflow-x-auto">
        {loading && <p className="text-gray-400 mt-4">Loading data...</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}

        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          {notebookContent.map((item, index) => (
            <div key={item.id} id={item.id} className="mt-6">
              {item.type === "markdown" ? (
                <div className="text-gray-300">
                  {item.content.split("\n").map((line, i) => {
                    const id = `title-${index}-${i}`;
                    if (line.startsWith("# "))
                      return (
                        <h1 key={i} id={id} className="text-3xl font-bold">
                          {line.replace("# ", "")}
                        </h1>
                      );
                    if (line.startsWith("## "))
                      return (
                        <h2 key={i} id={id} className="text-2xl font-semibold">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    if (line.startsWith("### "))
                      return (
                        <h3 key={i} id={id} className="text-xl font-medium">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    return (
                      <p key={i} className="mt-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="relative mt-4 bg-gray-700 p-4 rounded-lg">
                  <button
                    className="absolute top-2 right-2 bg-gray-600 text-white p-2 rounded transition-transform duration-200 hover:scale-110"
                    onClick={() => handleCopy(item.content, index)}
                  >
                    {copiedIndex === index ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <Clipboard size={18} />
                    )}
                  </button>
                  {/* <SyntaxHighlighter
                    language="python"
                    style={dracula}
                    className="text-sm"
                  >
                    {item.content}
                  </SyntaxHighlighter> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Right Sidebar - Table of Contents */}
      <aside className="hidden lg:block w-64 bg-gray-800 p-6 fixed right-0 top-16 bottom-0 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Daftar Isi</h2>
        <ul className="space-y-2">
          {titles.map((title, i) => (
            <li key={i}>
              <button
                onClick={() => scrollToTitle(title.id)}
                className="text-blue-400 hover:text-white text-start"
              >
                {title.text}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <ScrollToTop />
    </div>
  );
};

export default DetailProject;
