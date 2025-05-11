import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ChatMe from "./pages/ChatMe";
import Navbar from "./components/Navbar";
import ProjectPage from "./pages/ProjectPage";
import Game from "./pages/Game2";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/chat-me" element={<ChatMe />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/game" element={<Game />} />
        <Route
          path="/blog"
          element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-3xl font-bold">Under Maintenance</h1>
            </div>
          }
        />

        <Route
          path="/projects/detail"
          element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-3xl font-bold">Under Maintenance</h1>
            </div>
          }
        />
        {/* <Route path="/projects" element={<ProjectPage />} /> */}
        {/* <Route path="/projects/detail" element={<DetailProject />} /> */}
        {/* <Route path="/projects/:id" element={<ProjectPage />} /> */}
        {/* <Route path="/blog" element={<BlogPage />} /> */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </div>
  );
}

export default App;
