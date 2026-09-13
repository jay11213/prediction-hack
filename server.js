const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

let latestLiveStore = [];
let predictionLog = []; // Stores past predictions and their audit results
let currentActivePrediction = null; // Locked prediction for the active/upcoming period

// Receiver endpoint for real-time live data
app.post('/api/inject-data', (req, res) => {
  const data = req.body?.data?.list || req.body?.data || req.body?.list || [];
  if (Array.isArray(data) && data.length > 0) {
    let latestItem = data[0]; 
    let latestPeriod = String(latestItem.issueNumber || latestItem.period);
    let latestNum = parseInt(latestItem.number || latestItem.price);
    let actualOutcome = latestNum >= 5 ? "Big" : "Small";

    // 1. AUDIT: If we have a locked prediction for this newly finished period, grade it honestly now
    if (currentActivePrediction && currentActivePrediction.targetPeriod === latestPeriod) {
      let isWin = (currentActivePrediction.predictedChoice === actualOutcome);
      let auditRecord = {
        period: latestPeriod,
        predicted: currentActivePrediction.predictedChoice,
        actual: actualOutcome,
        number: latestNum,
        result: isWin ? "WIN" : "LOSS"
      };
      
      predictionLog.unshift(auditRecord); // Add to the top of our log
      console.log(`[AUDIT] Period ${latestPeriod} | Pred: ${auditRecord.predicted} | Actual: ${auditRecord.actual} (${latestNum}) -> ${auditRecord.result}`);
      
      // Clear current active prediction once audited
      currentActivePrediction = null;
    }

    // 2. PREDICT: Lock in a prediction for the *next* upcoming period based on history trends
    let nextPeriod = String(Number(latestPeriod) + 1);
    
    // Simple analytical rule (e.g., alternating or trend-based) instead of retroactive matching
    let nextChoice = latestNum % 2 === 0 ? "Small" : "Big"; 

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

// Endpoint serving data and prediction audit logs to frontend
app.get('/api/game-data', (req, res) => {
  if (latestLiveStore.length > 0) {
    return res.json(latestLiveStore);
  }
  return res.json([]);
});

app.get('*', (req, res) => {
  sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
