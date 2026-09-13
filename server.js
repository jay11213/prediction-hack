const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

let latestLiveStore = [];
let activePrediction = {
    targetPeriod: null,
    predictedChoice: null
};

// Receiver endpoint for real-time live data
app.post('/api/inject-data', (req, res) => {
  const data = req.body?.data?.list || req.body?.data || req.body?.list || [];
  if (Array.isArray(data) && data.length > 0) {
    latestLiveStore = data;
    
    // --- AUDIT & PREDICTION LOGIC ---
    let latestItem = data[0]; // Most recent finished round
    let latestPeriod = latestItem.issueNumber || latestItem.period;
    let latestNum = parseInt(latestItem.number || latestItem.price);
    let actualOutcome = latestNum >= 5 ? "Big" : "Small";

    // Check if we had an active prediction for this finished period
    if (activePrediction.targetPeriod === latestPeriod) {
        let status = (activePrediction.predictedChoice === actualOutcome) ? "WIN" : "LOSS";
        console.log(`[AUDIT RESULT] Period ${latestPeriod} | Predicted: ${activePrediction.predictedChoice} | Actual: ${actualOutcome} (${latestNum}) -> ${status}`);
    }

    // Generate prediction for the next upcoming period
    let nextPeriod = String(Number(latestPeriod) + 1);
    let nextChoice = latestNum % 2 === 0 ? "Big" : "Small";
    
    activePrediction = {
        targetPeriod: nextPeriod,
        predictedChoice: nextChoice
    };
    console.log(`[PREDICTION] Next Period ${nextPeriod} -> Bet on: ${nextChoice}`);
    // --------------------------------

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
