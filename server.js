const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Native CORS headers (prevents missing module crashes)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

let latestLiveStore = [];
let predictionLog = []; 
let currentActivePrediction = null; 
let liveTimer = 60;

app.post('/api/inject-data', (req, res) => {
  const payload = req.body;
  const data = Array.isArray(payload) ? payload : (payload?.data?.list || payload?.data || payload?.list || []);

  if (Array.isArray(data) && data.length > 0) {
    let latestItem = data[0]; 
    let latestPeriod = String(latestItem.issueNumber || latestItem.period || latestItem.gameNo || latestItem.stage || "");
    let latestNum = parseInt(latestItem.number ?? latestItem.price ?? latestItem.winningNumber ?? latestItem.sum ?? 0);
    
    let actualOutcome = latestNum >= 5 ? "Big" : "Small";

    if (currentActivePrediction && currentActivePrediction.targetPeriod === latestPeriod) {
      let isWin = (currentActivePrediction.predictedChoice === actualOutcome);
      let auditRecord = {
        period: latestPeriod,
        predicted: currentActivePrediction.predictedChoice,
        actual: actualOutcome,
        number: latestNum,
        status: isWin ? "WIN" : "LOSS"
      };
      
      if (!predictionLog.some(p => p.period === latestPeriod)) {
        predictionLog.unshift(auditRecord);
        if (predictionLog.length > 50) predictionLog.pop(); 
      }
      
      currentActivePrediction = null;
    }

    if (latestPeriod) {
      let latestNumClean = isNaN(latestNum) ? 0 : latestNum;
      let nextPeriod = String(Number(latestPeriod) + 1);
      if (!currentActivePrediction || currentActivePrediction.targetPeriod !== nextPeriod) {
        let nextChoice = (latestNumClean % 2 === 0) ? "Small" : "Big"; 
        currentActivePrediction = {
          targetPeriod: nextPeriod,
          predictedChoice: nextChoice
        };
      }
    }

    latestLiveStore = data;
    return res.json({ status: "success", count: data.length });
  }
  return res.status(400).json({ status: "error", message: "No valid array found" });
});

app.post('/api/inject-timer', (req, res) => {
  if (req.body && typeof req.body.timer === 'number') {
    liveTimer = req.body.timer;
  }
  return res.json({ status: "success" });
});

app.get('/api/game-data', (req, res) => {
  return res.json({
    code: 0,
    data: latestLiveStore,
    predictions: predictionLog,
    activePrediction: currentActivePrediction,
    timer: liveTimer
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
