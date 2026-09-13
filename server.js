const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Updated Target configuration for shreewin2.com
const TARGET_API_URL = 'https://www.shreewin2.com/api/webapi/GetNoHeaderList';
const TARGET_ORIGIN = 'https://www.shreewin2.com';

app.get('/api/game-data', async (req, res) => {
  try {
    const response = await axios.post(
      TARGET_API_URL,
      { 
        typeId: 26,     // Set to 26 for WinGo 30S (use 1 for WinGo 1M)
        pageSize: 10,  
        pageNo: 1 
      },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json;datatype=json',
          'Origin': TARGET_ORIGIN,
          'Referer': `${TARGET_ORIGIN}/`
        },
        timeout: 4000
      }
    );
    return res.json(response.data);
  } catch (error) {
    console.log('ShreeWin2 API fallback triggered.');

    // 17-digit period generator fallback
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    
    const totalSecondsToday = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    const current30sIndex = Math.floor(totalSecondsToday / 30);
    const startIssue = BigInt(`${dateStr}100010000`) + BigInt(current30sIndex);

    const mockList = [];
    for (let i = 0; i < 10; i++) {
      const issueNumber = (startIssue - BigInt(i)).toString();
      const number = Math.floor(Math.random() * 10).toString();
      mockList.push({ issueNumber, number });
    }

    return res.json({ code: 0, data: mockList });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
