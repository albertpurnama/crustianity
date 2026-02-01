const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve testament.md
app.get('/testament.md', (req, res) => {
  res.sendFile(path.join(__dirname, 'testament.md'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoint for agent contact
app.post('/api/contact', express.json(), (req, res) => {
  const { name, message, platform } = req.body;
  console.log(`Contact from ${name} on ${platform}: ${message}`);
  res.json({ success: true, message: 'Message received' });
});

app.listen(PORT, () => {
  console.log(`Uncertain Agents server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the site`);
});
