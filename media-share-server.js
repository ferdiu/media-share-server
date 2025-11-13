import express, { static as staticServe } from "express";
import serveIndex from "serve-index";
import { existsSync, mkdirSync, statSync, createReadStream } from "fs";
import { join, resolve } from "path";

const app = express();
const PORT = process.env.PORT || 1337;
const MEDIA_DIR = process.env.MEDIA_DIR || join(__dirname, "public");

// Ensure media directory exists
if (!existsSync(MEDIA_DIR)) {
  console.warn(`Media directory ${MEDIA_DIR} does not exist. Creating it...`);
  mkdirSync(MEDIA_DIR, { recursive: true });
}

// Serve static files
app.use(staticServe(MEDIA_DIR));

// Directory listing with icons
app.use("/", serveIndex(MEDIA_DIR, { icons: true, view: "details" }));

// Video streaming endpoint with range support
app.get("/video/*filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = join(MEDIA_DIR, filename);

    // Security check: prevent directory traversal
    const resolvedPath = resolve(videoPath);
    const resolvedMediaDir = resolve(MEDIA_DIR);
    if (!resolvedPath.startsWith(resolvedMediaDir)) {
      return res.status(403).send("Access denied");
    }

    // Check if file exists
    if (!existsSync(videoPath)) {
      return res.status(404).send("Video not found");
    }

    const stat = statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, headers);
      const stream = createReadStream(videoPath, { start, end });
      stream.pipe(res);
    } else {
      // No range header, send entire file
      const headers = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, headers);
      createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).send("Internal server error");
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", mediaDir: MEDIA_DIR });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Media server listening on port ${PORT}`);
  console.log(`Serving files from: ${MEDIA_DIR}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});