const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Endpoint to fetch real WinGo 1 Min game data
app.get('/api/game-data', async (req, res) => {
  try {
    const timestamp = Date.now();
    const targetUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=${timestamp}`;
    
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live game data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
