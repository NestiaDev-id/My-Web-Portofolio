import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import P5RansomText from "../components/P5RansomText";
import { projects } from "../data/projects";

// Map categories to colors for the language dot
const categoryColors: Record<string, string> = {
  "All": "#e60012",
  "Website Development": "#f1e05a",
  "Data Science": "#3572A5",
  "Mobile Development": "#3178c6",
};

// Deterministic hash for card tilt
function hash(str: string): number {
  let h = 9;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 387420489);
  }
  return (h ^ (h >>> 9)) >>> 0;
}

// Split title: first word renders red
function splitTitle(title: string) {
  const first = title.split(" ")[0];
  const rest = title.slice(first.length);
  return { first, rest };
}

const CATEGORIES = ["All", "Website Development", "Data Science", "Mobile Development"];

export default function ProjectPage() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    const unlock = () => { audioUnlocked.current = true; };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const playSelect = useCallback(() => {
    if (!audioUnlocked.current || !sfxRef.current) return;
    try {
      sfxRef.current.currentTime = 0;
      sfxRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="relative z-[2] min-h-screen px-[4vw] py-[2vh] p5-scroll overflow-y-auto">
      <audio ref={sfxRef} src="/p5/sfx/select.mp3" preload="auto" />

      {/* Screen Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p5-screen-head">
          <P5RansomText text="PROJECTS" />
        </div>
        <button
          className="p5-back-hint"
          onClick={() => {
            playSelect();
            navigate("/");
          }}
        >
          ESC · Back
        </button>
      </div>

      {/* Filter Chips — styled as contact chips */}
      <div className="flex flex-wrap gap-4 mb-[4vh]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`p5-contact-chip transition-all ${
              filter === cat
                ? "!bg-p5-red !text-p5-white scale-105"
                : ""
            }`}
            onClick={() => {
              setFilter(cat);
              playSelect();
            }}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Grid Label */}
      <div className="p5-grid-label">
        <span className="bar"></span>
        {filter === "All" ? "All Projects" : filter}
        <span className="ml-3 text-sm opacity-70">
          ({filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"})
        </span>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-[10vh]">
        {filteredProjects.map((project, i) => {
          const tilt = ((hash(project.slug) % 5) - 2) * 0.8;
          const { first, rest } = splitTitle(project.title);
          const langColor = categoryColors[project.category] || "#e60012";

          return (
            <a
              key={project.slug}
              className={`p5-card ${project.status === "Production" ? "feat" : ""}`}
              style={{
                "--tilt": `${tilt}deg`,
                "--d": `${i * 70}ms`,
                "--lc": langColor,
              } as React.CSSProperties}
              href={project.demo && project.demo !== "#" ? project.demo : project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // If clicking on internal links, navigate internally
                if (project.slug) {
                  e.preventDefault();
                  playSelect();
                  navigate(`/projects/${project.slug}`, {
                    state: { github: project.github, demo: project.demo },
                  });
                }
              }}
            >
              {/* Thumbnail */}
              <div className="thumb">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).closest(".thumb")?.remove();
                  }}
                />
              </div>

              {/* Language tag */}
              <span className="lang">{project.category}</span>

              {/* Title with first word in red */}
              <h3>
                {project.status === "Production" && (
                  <span className="p5-live-dot" />
                )}
                <em>{first}</em>{rest}
              </h3>

              {/* Description */}
              <p>{project.description}</p>

              {/* Meta footer */}
              <div className="meta">
                <span>
                  {project.status === "Production"
                    ? "LIVE NOW"
                    : project.status === "Completed"
                    ? "COMPLETED"
                    : project.status === "Ongoing"
                    ? "ONGOING"
                    : "IN DEV"}
                </span>
                <span className="go">
                  {project.demo && project.demo !== "#"
                    ? "View Demo →"
                    : "View on GitHub →"}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
