import { Route, Routes, useLocation } from "react-router-dom";
import P5Background from "./components/P5Background";
import P5Cursor from "./components/P5Cursor";
import P5HUD from "./components/P5HUD";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("./pages/Home"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ChatMe = lazy(() => import("./pages/ChatMe"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const Game = lazy(() => import("./pages/Game2"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestingPage = lazy(() => import("./pages/Testing"));

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center bg-p5-ink text-[#e4002b]"
    >
      <div className="text-center">
        <div className="mb-3 text-4xl font-black italic tracking-widest">
          NOW
        </div>
        <div className="text-sm font-bold uppercase tracking-[0.35em] text-white">
          Loading...
        </div>
      </div>
      </div>
      )}
    </MusicPlayerProvider>
  );
}

function App() {
  const location = useLocation();

  if (location.pathname === "/testing") {
    return (
      <Suspense fallback={<RouteLoading />}>
        <TestingPage />
      </Suspense>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-p5-condensed text-p5-white">
      <P5Background />
      <div id="p5-slash" aria-hidden="true" />
      <P5Cursor />
      <div id="p5-shell" className="relative z-2 flex min-h-screen flex-col">
        <P5HUD />
        <div className="relative flex-1 overflow-hidden">
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/chat-me" element={<ChatMe />} />
              <Route path="/projects" element={<ProjectPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/game" element={<Game />} />
              <Route
                path="/blog"
                element={
                  <div className="flex h-screen items-center justify-center">
                    <h1 className="text-3xl font-bold">Under Maintenance</h1>
                  </div>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
