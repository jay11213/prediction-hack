let timeLeft = 60; // Default WinGo 1-min countdown fallback

async function fetchGameData() {
    try {
        const response = await fetch('/api/game-data');
        const json = await response.json();
        
        const gameList = Array.isArray(json) ? json : (json.data || []);
        const predictions = json.predictions || [];
        const activePred = json.activePrediction;

        updateUI(gameList, predictions, activePred);
    } catch (err) {
        console.error("Failed to fetch game data:", err);
    }
}

function updateUI(gameList, predictions, activePred) {
    if (gameList.length === 0) return;

    const latest = gameList[0];
    const period = String(latest.issueNumber || latest.period || latest.gameNo || "—");

    // 1. Update Current Period Display
    const periodEl = document.getElementById('current-period') || document.querySelector('.current-period');
    if (periodEl) {
        let targetPer = activePred ? activePred.targetPeriod : String(Number(period) + 1);
        if (periodEl.textContent !== targetPer) {
            periodEl.textContent = targetPer;
            timeLeft = 60; // Reset timer when period shifts
        }
    }

    // 2. Update Model Signal
    const signalEl = document.getElementById('model-signal') || document.querySelector('.model-signal');
    if (signalEl) {
        signalEl.textContent = activePred ? activePred.predictedChoice : "Waiting...";
    }

    // 3. Update Win Rate & Stats
    let total = predictions.length;
    let wins = predictions.filter(p => p.status === "WIN").length;
    let winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : "0";

    const winRateEl = document.getElementById('win-rate') || document.querySelector('.win-rate');
    if (winRateEl) winRateEl.textContent = `${winRate}% WIN RATE`;

    const totalEl = document.getElementById('total-count') || document.querySelector('.total-count');
    if (totalEl) totalEl.textContent = total;

    const jackpotsEl = document.getElementById('jackpots-count') || document.querySelector('.jackpots-count');
    if (jackpotsEl) jackpotsEl.textContent = wins;

    // 4. Update History Table (Latest 10)
    const tableBody = document.getElementById('history-table-body') || document.querySelector('tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        
        predictions.slice(0, 10).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.period}</td>
                <td>${item.actual} (${item.number})</td>
                <td>${item.predicted}</td>
                <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Countdown timer ticker loop (runs every second)
setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) timeLeft = 59;
    
    const timerEl = document.getElementById('timer');
    if (timerEl) {
        let seconds = String(timeLeft % 60).padStart(2, '0');
        timerEl.textContent = `00:${seconds}`;
    }
}, 1000);

// Poll backend every 1.5 seconds to keep data synced
setInterval(fetchGameData, 1500);
fetchGameData();
