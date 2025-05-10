import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/check-server", (req, res) => {
  res.send("Server is running");
});

// Handle all routes - send index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

connectToDatabase()
  .then(() => {
    const PORT = process.env.PORT;
    const DOMAIN = process.env.DOMAIN || "localhost";
    const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";

    app.listen(PORT, () => {
      console.log(`Server berjalan di ${PROTOCOL}://${DOMAIN}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Gagal menyambungkan ke database:", error);
  });
