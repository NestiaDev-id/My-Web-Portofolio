import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import HomePage from "./pages/HomePage";
import LoadingPage from "./components/LoadingPage";
import Navbar from "./components/Navbar";
import AboutPage from "./pages/AboutPage";
import ProjectPage from "./pages/ProjectPage";
import BlogPage from "./pages/BlogPage";
import DetailProject from "./pages/DetailProject";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000); // Simulasi loading selama 3 detik
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/projects/detail" element={<DetailProject />} />
        {/* <Route path="/projects/:id" element={<ProjectPage />} /> */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
