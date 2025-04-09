const express = require("express");
const app = express();
const fs = require("fs");

var serveIndex = require('serve-index');

app.use(express.static(__dirname + "/public"))
app.use('/', serveIndex(__dirname + '/public', {'icons': true}));

app.get(function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const video_name = req.params.path_to_video;
  const videoPath = video_name;
  const videoSize = fs.statSync(video_name).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

/*app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});*/

app.listen(1337, function () {
  console.log("Listening on port 1337!");
});
