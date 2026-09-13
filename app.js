let currentPeriod = "";

async function fetchGameData() {
  try {
    const response = await fetch('/api/game-data');
    const result = await response.json();
    
    if (result && result.data && result.data.length > 0) {
      const latest = result.data[0];
      
      // Update real period number (incrementing by 1 for current active round)
      const latestIssue = BigInt(latest.issueNumber);
      currentPeriod = (latestIssue + 1n).toString();
      
      const periodElem = document.getElementById('period') || document.getElementById('current-period');
      if (periodElem) periodElem.innerText = currentPeriod;

      // Render history table
      renderHistory(result.data);
    }
  } catch (err) {
    console.error("Error fetching game data:", err);
  }
}

function renderHistory(historyData) {
  const historyElem = document.getElementById('history') || document.getElementById('prediction-history');
  if (!historyElem) return;

  historyElem.innerHTML = historyData.slice(0, 10).map(item => {
    const num = parseInt(item.number, 10);
    const resultType = num >= 5 ? 'BIG' : 'SMALL';
    const statusClass = num >= 5 ? 'win' : 'loss';

    return `
      <div class="history-item">
        <span>Period: ${item.issueNumber}</span>
        <span>Number: ${item.number}</span>
        <span class="status ${statusClass}">${resultType}</span>
      </div>
    `;
  }).join('');
}

// 60-second timer countdown sync for WinGo 1 Min
function startTimer() {
  setInterval(() => {
    const now = new Date();
    const secondsLeft = 60 - now.getSeconds();
    
    const timerElem = document.getElementById('timer') || document.getElementById('countdown');
    if (timerElem) {
      timerElem.innerText = `00:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    }

    // Refresh game data at the start of each new minute
    if (secondsLeft === 59) {
      fetchGameData();
    }
  }, 1000);
}

// Initial fetch and start timer
fetchGameData();
startTimer();
