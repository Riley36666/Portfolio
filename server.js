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





app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "game.html"));
});

// Terminal Routes (dont touch)
app.get("/terminal", (req, res) => {
  console.log("Terminal route hit!");
  res.sendFile(path.join(__dirname, "private", "terminal.html"));
});
app.post("/autocomplete", (req, res) => {
  const { command } = req.body;

  // Get the last word the user typed (to autocomplete just that part)
  const lastWord = command.split(" ").pop();

  // Use compgen to get matching completions
  const shellCmd = `bash -c 'compgen -c -- ${lastWord}'`;

  exec(shellCmd, (err, stdout, stderr) => {
    if (err || stderr) {
      return res.send(command); // Return the original if there's an error
    }

    const suggestions = stdout.split("\n").filter(Boolean);

    if (suggestions.length === 1) {
      // Replace the last word with the suggestion
      const updatedCommand = command.replace(new RegExp(`${lastWord}$`), suggestions[0]);
      return res.send(updatedCommand);
    } else if (suggestions.length > 1) {
      // Just show suggestions to the user (optional)
      return res.json({ suggestions, partial: command });
    }

    res.send(command); // No match
  });
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

// Start Server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Server is now accessable!`);
});
