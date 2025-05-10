import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;

  console.log("Current mode:", mode);
  console.log("Using API URL:", apiUrl);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": apiUrl,
        "/assets": apiUrl,
      },
    },
    build: {
      sourcemap: true,
      minify: "terser",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
  };
});
