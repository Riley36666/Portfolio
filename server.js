// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { pathToFileURL } = require('url');
const app = express();
const port = 3000;
const ttydPort = 7681;
const { createProxyMiddleware } = require('http-proxy-middleware');
const { exec } = require('child_process');
let currentDirectory = process.env.HOME || '/home/knowles'; // Starting dir


// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.static(__dirname));

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", username, password);
  console.log("Expected from env:", process.env.USERNAME, process.env.PASSWORD);

  if (
    username === process.env.USERNAME &&
    password === process.env.PASSWORD
  ) {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});


app.post("/execute", (req, res) => {
  const { command } = req.body;

  // Handle 'cd' manually
  if (command.startsWith('cd ')) {
    const target = command.split('cd ')[1].trim();

    // Resolve path
    const path = require('path');
    const newPath = path.resolve(currentDirectory, target);

    const fs = require('fs');
    if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
      currentDirectory = newPath;
      return res.send(`Changed directory to ${currentDirectory}`);
    } else {
      return res.send(`No such directory: ${target}`);
    }
  }

  // Otherwise, run the command in the currentDirectory
  exec(command, { cwd: currentDirectory }, (error, stdout, stderr) => {
    if (error) return res.send(`Error: ${stderr}`);
    res.send(stdout);
  });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "game.html"));
});
app.get("/terminal", (req, res) => {
  res.sendFile(path.join(__dirname, "private", "terminal.html"));
});
app.use('/now', createProxyMiddleware({
  target: `http://localhost:${ttydPort}`,
  changeOrigin: true,
  ws: true,  // Ensure WebSocket support for ttyd
  pathRewrite: {
      '^/terminal': '/',  // Rewrite the URL path if necessary
  },
}));
app.post("/autocomplete", (req, res) => {
  const { command } = req.body;

  // Use compgen for bash-style autocomplete
  exec(`bash -c 'compgen -c "${command}"'`, (err, stdout, stderr) => {
    if (err || stderr) return res.send(command);

    const suggestions = stdout.split("\n").filter(Boolean);

    if (suggestions.length === 1) {
      return res.send(suggestions[0]);
    } else if (suggestions.length > 1) {
      // If multiple, show list below
      appendOutput(suggestions.join("    "));
      return res.send(command); // keep the command as-is
    }

    res.send(command); // No match, return unchanged
  });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Server is now accessable!`);
});
