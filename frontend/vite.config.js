import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: isDev,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router")
              ) {
                return "vendor";
              }
              if (id.includes("@tanstack/react-query")) {
                return "query";
              }
              if (
                id.includes("framer-motion") ||
                id.includes("@radix-ui")
              ) {
                return "ui";
              }
            }
            return "app";
          },
        },
      },
    },
  };
});

