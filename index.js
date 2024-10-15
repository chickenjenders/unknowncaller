const express = require("express");
const { Buffer } = require("node:buffer");
const { join, dirname } = require("node:path");
const { fileURLToPath } = require("node:url");
const dotenv = require("dotenv");
const cors = require("cors"); // Import the cors package

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Function to get the directory name
//const __dirname = dirname(fileURLToPath(import.meta.url));

// Use the cors middleware
app.use(cors());
app.use(express.json());

// Serve static files (like styles.css) from the public directory
app.use(express.static(join(__dirname)));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
app.post("/gpt", async (req, res) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY}`, // Your OpenAI API key
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Generate a response as if you are a person answering the phone. Make the response sound accurate to the expereince of someone answering a prank call. Responses should vary from irritated, bored, extremely scared of the user, and people who are very strange in the way the respond. Responses can include complete random nonsense and creepy cryptic messages. All responses should be very emotional and easy to tell what the person answering is feeling. The user experience should encourage them to try calling someone else. Avoid using astericks to express noises and do not include sound effects of hanging up. Make response at least 20 seconds.",
        },
        { role: "user", content: "heavy breathing" },
      ],
    }),
  });

  const data = await response.json();
  console.log(data);
  res.status(200).json(data);
});
// Endpoint to retrieve the secret
app.post("/tts", async (req, res) => {
  console.log("body", req.body);

  //randomly generate a large number to select a voice
  const index = Math.floor(Math.random() * 100) % 6;
  const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  const voice = voices[index];

  const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY}`, // Your OpenAI API key
    },
    body: JSON.stringify({
      model: "tts-1",
      input: req.body.message,
      voice: voice,
      speed: 1.1,
    }),
  });

  // Read the response as a buffer
  const audioBuffer = await ttsResponse.arrayBuffer();

  // Convert the buffer to a Node.js Buffer object
  const audioData = Buffer.from(audioBuffer);

  // Set the appropriate headers for the audio response
  res.set({
    "Content-Type": "audio/mp3", // or "audio/wav" depending on the format returned by the API
    "Content-Length": audioData.length,
  });

  // Send the audio data as a binary response
  res.status(200).send(audioData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
