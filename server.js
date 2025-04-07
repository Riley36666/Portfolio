// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;




// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.get('*', (req, res, next) => {
  let url = req.url.replace(/\/$/, ''); // Remove trailing slash if exists
  if (!path.extname(url)) {
    url = `${url}.html`;
  }
  const filePath = path.join(__dirname, url);
  res.sendFile(filePath, (err) => {
    if (err) {
      next();
    }
  });
});
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Start Server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
