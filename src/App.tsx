import { Route, Routes, useLocation } from "react-router-dom";
// import HomePage from "./pages/Home";
// import AboutPage from "./pages/AboutPage";
// import ChatMe from "./pages/ChatMe";
// import ProjectPage from "./pages/ProjectPage";
// import ProjectDetailPage from "./pages/ProjectDetailPage";
// import Game from "./pages/Game2";
// import NotFound from "./pages/NotFound";
// import TestingPage from "./pages/Testing";
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
      className="flex min-h-[50vh] items-center justify-center bg-[#111] text-[#e4002b]"
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
    <div className="relative min-h-screen font-p5-condensed text-p5-white overflow-hidden">
      {/* Fixed background layers */}
      <P5Background />

      {/* Diagonal black slash */}
      <div id="p5-slash" aria-hidden="true" />

      {/* Custom animated cursor */}
      <P5Cursor />

      {/* Main shell */}
      <div id="p5-shell" className="relative z-[2] flex flex-col min-h-screen">
        {/* Top HUD */}
        <P5HUD />

        {/* Stage: page content */}
        <div className="flex-1 relative overflow-hidden">
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
                  <div className="flex items-center justify-center h-screen">
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
