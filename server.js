const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Proxy API route to fetch external WinGo 1 Min game data
app.get('/api/game-data', async (req, res) => {
  try {
    const response = await axios.post(
      'https://ar-lottery01.com/api/webapi/GetNoHeaderList',
      {
        typeId: 1,
        pageSize: 10,
        pageNo: 1
      },
      {
        headers: {
          'Content-Type': 'application/json;datatype=json'
        },
        timeout: 5000
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('API Fetch Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch game data', details: error.message });
  }
});

// Serve main index page for root route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
