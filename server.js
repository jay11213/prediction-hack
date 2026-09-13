const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const TARGET_API_URL = 'https://www.shreewin35.com/api/webapi/GetNoHeaderList';
const TARGET_ORIGIN = 'https://www.shreewin35.com';

app.get('/api/game-data', async (req, res) => {
  const typeId = parseInt(req.query.typeId, 10) || 26; // 26 = 30S, 1 = 1M

  try {
    const response = await axios.post(
      TARGET_API_URL,
      { typeId: typeId, pageSize: 10, pageNo: 1 },
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
    return res.status(500).json({ code: -1, message: "Proxy Blocked" });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
