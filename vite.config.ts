import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("/phaser/")) return "vendor-phaser";
          if (
            id.includes("/three/") ||
            id.includes("/@react-three/") ||
            id.includes("/cannon-es/") ||
            id.includes("/postprocessing/")
          ) {
            return "vendor-three";
          }
          if (
            id.includes("/mermaid/") ||
            id.includes("/cytoscape/") ||
            id.includes("/katex/")
          ) {
            return "vendor-diagrams";
          }
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/framer-motion/")
          ) {
            return "vendor-react";
          }

          return undefined;
        },
      },
    },
  },
});
