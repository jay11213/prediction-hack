async function fetchGameData() {
    try {
        let response = await fetch('/api/game-data');
        let json = await response.json();
        
        if (json.code === 0) {
            updateUI(json.data, json.predictions, json.activePrediction);
        }
    } catch (e) {
        console.error("Error fetching game data:", e);
    }
}

function updateUI(historyList, predictions, activePred) {
    // 1. Update Active Prediction Signal
    let signalEl = document.querySelector('.model-signal'); // Adjust selector to match your HTML
    let periodEl = document.querySelector('.current-period'); // Adjust selector to match your HTML
    
    if (activePred) {
        if (signalEl) signalEl.innerText = activePred.predictedChoice;
        if (periodEl) periodEl.innerText = activePred.targetPeriod;
    }

    // 2. Update Result History Table
    let tableBody = document.querySelector('tbody'); // Adjust selector to match your table
    if (tableBody && predictions) {
        tableBody.innerHTML = '';
        predictions.forEach(item => {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.period}</td>
                <td>${item.actual} (${item.number})</td>
                <td>${item.predicted}</td>
                <td style="color: ${item.status === 'WIN' ? '#22c55e' : '#ef4444'}; font-weight: bold;">${item.status}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Poll every 1 second for real-time updates
setInterval(fetchGameData, 1000);
fetchGameData();
