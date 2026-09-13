const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

let latestLiveStore = [];

// Receiver endpoint for real-time live data
app.post('/api/inject-data', (req, res) => {
  const data = req.body?.data?.list || req.body?.data || req.body?.list || [];
  if (Array.isArray(data) && data.length > 0) {
    latestLiveStore = data;
    console.log(`[LIVE SYNC] Received ${data.length} real results from browser.`);
    return res.json({ status: "success" });
  }
  return res.status(400).json({ status: "error" });
});

// Endpoint serving data to app.js
app.get('/api/game-data', (req, res) => {
  if (latestLiveStore.length > 0) {
    return res.json({ code: 0, data: latestLiveStore });
  }
  return res.json({ code: -1, message: "Waiting for Tampermonkey relay..." });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
