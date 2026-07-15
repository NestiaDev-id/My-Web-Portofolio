import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ChatMe from "./pages/ChatMe";
import ProjectPage from "./pages/ProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import Game from "./pages/Game2";
import P5Background from "./components/P5Background";
import P5Cursor from "./components/P5Cursor";
import P5HUD from "./components/P5HUD";

function App() {
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
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
