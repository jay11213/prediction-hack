const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

let latestLiveStore = [];
let predictionLog = []; 
let currentActivePrediction = null; 

// Receiver endpoint for real-time live data from Tampermonkey
app.post('/api/inject-data', (req, res) => {
  const data = req.body?.data?.list || req.body?.data || req.body?.list || [];
  if (Array.isArray(data) && data.length > 0) {
    let latestItem = data[0]; 
    
    // Safely extract period and number using multiple fallback keys
    let latestPeriod = String(latestItem.issueNumber || latestItem.period || latestItem.gameNo || "");
    let latestNum = parseInt(latestItem.number ?? latestItem.price ?? latestItem.winningNumber ?? 0);
    
    let actualOutcome = latestNum >= 5 ? "Big" : "Small";

    // 1. AUDIT: Grade the previous locked prediction honestly
    if (currentActivePrediction && currentActivePrediction.targetPeriod === latestPeriod) {
      let isWin = (currentActivePrediction.predictedChoice === actualOutcome);
      let auditRecord = {
        period: latestPeriod,
        predicted: currentActivePrediction.predictedChoice,
        actual: actualOutcome,
        number: latestNum,
        status: isWin ? "WIN" : "LOSS"
      };
      
      predictionLog.unshift(auditRecord);
      if (predictionLog.length > 50) predictionLog.pop(); // Keep last 50 entries
      console.log(`[AUDIT] Period ${latestPeriod} | Pred: ${auditRecord.predicted} | Actual: ${auditRecord.actual} (${latestNum}) -> ${auditRecord.status}`);
      
      currentActivePrediction = null;
    }

    // 2. PREDICT: Lock in next prediction for the upcoming round
    let nextPeriod = String(Number(latestPeriod) + 1);
    let nextChoice = (latestNum % 2 === 0) ? "Small" : "Big"; 

    currentActivePrediction = {
      targetPeriod: nextPeriod,
      predictedChoice: nextChoice
    };

    console.log(`[LOCKED PREDICTION] For Period ${nextPeriod} -> Bet on: ${nextChoice}`);

    latestLiveStore = data;
    return res.json({ status: "success" });
  }
  return res.status(400).json({ status: "error" });
});

// Endpoint serving game data AND prediction logs to frontend UI
app.get('/api/game-data', (req, res) => {
  return res.json({
    code: 0,
    data: latestLiveStore,
    predictions: predictionLog,
    activePrediction: currentActivePrediction
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
