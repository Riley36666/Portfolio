// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { exec } from 'child_process';
import notesRouter from './api/notes.js';
import { OpenAI } from 'openai';
const app = express();
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT | 9999
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});
import fs from 'fs';
const CHAT_HISTORY_FILE = './ai/chatHistory.json';

const website = process.env.WEBSITE
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


function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
}
function saveHistory(messages) {
  fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(messages, null, 2));
}


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "game.html"));
});
app.get("/timetable", (req, res) => {
  res.sendFile(path.join(__dirname, "TimeTable", "timetable.html"));
})
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes/notes.html'));
});
app.get('/cv', (req, res) => {
  res.sendFile(path.join(__dirname, 'cv/cv.html'));
});
app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'calendar/calendar.html'));
});
app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai/ai.html'));
});
app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'projects/project.html'));
});
app.get('/api/website', (req, res) => {
  res.json({ website: process.env.WEBSITE });
});


app.use(express.static('public'));


app.use(express.json());
app.use('/api/notes', notesRouter);



app.post('/api/chat', async (req, res) => {
  let history = loadHistory();
  const userMessage = req.body.message;

  // Optional: include system prompt to guide behavior
  const systemPrompt = {
    role: 'system',
    content: 'You are a helpful assistant. Keep the conversation coherent and continuous.',
  };

  // Combine system prompt + history + new message
  let messages = [systemPrompt, ...history, { role: 'user', content: userMessage }];

  // Trim to most recent 20 exchanges (user + assistant = 40 messages)
  const MAX_TURNS = 20;
  const turnMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
  const trimmedTurns = turnMessages.slice(-MAX_TURNS * 2);
  messages = [systemPrompt, ...trimmedTurns, { role: 'user', content: userMessage }];

  try {
    const completion = await openai.chat.completions.create({
      model: 'nvidia/llama-3.1-nemotron-70b-instruct',
      messages,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const reply = completion.choices[0].message.content;

    // Append new messages to history and save
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: reply });
    saveHistory(history);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



// Terminal Routes (dont touch)
app.get("/terminal", (req, res) => {
  console.log("Terminal route hit!");
  res.sendFile(path.join(__dirname, "private", "terminal.html"));
});
app.post("/autocomplete", (req, res) => {
  const { command } = req.body;
  const fs = require('fs');
  const path = require('path');

  // Split into command and argument
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0];
  const arg = parts[1] || "";

  if (cmd === "cd") {
    try {
      const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });

      const dirs = entries
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith(arg))
        .map(dirent => dirent.name);

      return res.json({ suggestions: dirs });
    } catch (err) {
      return res.status(500).json({ suggestions: [], error: "Failed to read directory" });
    }
  }

  // Default: fallback to shell command autocomplete for normal commands
  const lastWord = command.split(" ").pop();
  const shellCmd = `bash -c 'compgen -c -- ${lastWord}'`;

  exec(shellCmd, (err, stdout, stderr) => {
    if (err || stderr) {
      return res.send(command); // Return original on error
    }

    const suggestions = stdout.split("\n").filter(Boolean);

    if (suggestions.length === 1) {
      const updatedCommand = command.replace(new RegExp(`${lastWord}$`), suggestions[0]);
      return res.send(updatedCommand);
    } else if (suggestions.length > 1) {
      return res.json({ suggestions, partial: command });
    }

    res.send(command);
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


try {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Server is running on https://${website}`)
    console.log(`Server is now accessible!`);
  });
} catch (err) {
  console.error("🚨 Server failed to start:", err);
}
