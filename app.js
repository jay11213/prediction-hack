function generateContrarianPrediction(historyList) {
  if (!historyList || historyList.length < 5) {
    return { signal: "BIG", confidence: 85, backups: [7, 8] };
  }

  // Map latest 5 results (1 = BIG, 0 = SMALL)
  const recent = historyList.slice(0, 5).map(item => {
    const num = parseInt(item.number || item.result || 0, 10);
    return num >= 5 ? 1 : 0;
  });

  const bigCount = recent.reduce((a, b) => a + b, 0);
  const lastResult = recent[0];

  let predictedCrowdBet = "BIG"; // What 80% of users are likely betting
  let antiCrowdSignal = "SMALL"; // What our script will predict
  let confidenceScore = 88;

  // Case 1: Crowd Chasing a Streak (3+ BIGs in a row)
  if (bigCount >= 4) {
    // Crowd is heavily betting BIG to chase the trend
    predictedCrowdBet = "BIG";
    antiCrowdSignal = "SMALL"; 
    confidenceScore = 93;
  } 
  // Case 2: Crowd Chasing SMALL Streak
  else if (bigCount <= 1) {
    // Crowd is heavily betting SMALL
    predictedCrowdBet = "SMALL";
    antiCrowdSignal = "BIG";
    confidenceScore = 94;
  } 
  // Case 3: Alternating Pattern (BIG, SMALL, BIG, SMALL)
  else if (recent[0] !== recent[1] && recent[1] !== recent[2]) {
    // Crowd expects pattern to keep switching -> reverse it!
    antiCrowdSignal = lastResult === 1 ? "BIG" : "SMALL";
    confidenceScore = 87;
  } 
  // Case 4: Balanced Distribution (Standard Contrarian Reversal)
  else {
    antiCrowdSignal = lastResult === 1 ? "SMALL" : "BIG";
    confidenceScore = 85;
  }

  // Backup numbers target high-probability digits for the contrarian choice
  const backupNumbers = antiCrowdSignal === "BIG" ? [7, 8] : [1, 2];

  return {
    signal: antiCrowdSignal,
    confidence: confidenceScore,
    backups: backupNumbers
  };
}
