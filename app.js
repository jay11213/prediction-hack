let currentPeriod = "";

// Login function
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("button") || document.querySelector(".btn") || document.getElementById("loginBtn");
  
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const inputs = document.querySelectorAll("input");
      const userId = inputs[0] ? inputs[0].value.trim() : "";
      const password = inputs[1] ? inputs[1].value.trim() : "";

      if ((userId === "demo_user" || userId === "demo") && (password === "demo_pass" || password === "demo")) {
        const loginContainer = document.querySelector(".card") || document.querySelector("form") || document.querySelector(".login-container");
        if (loginContainer) loginContainer.style.display = "none";
        
        const dashboard = document.getElementById("dashboard") || document.querySelector(".dashboard");
        if (dashboard) dashboard.style.display = "block";
      } else {
        alert("Invalid User ID or Password. Use demo_user and demo_pass");
      }
    });
  }
});

// Fetch game data from server
async function fetchGameData() {
  try {
    const response = await fetch('/api/game-data');
    const result = await response.json();
    
    if (result && result.data && result.data.length > 0) {
      const latest = result.data[0];
      const latestIssue = BigInt(latest.issueNumber);
      currentPeriod = (latestIssue + 1n).toString();
      
      const periodElem = document.getElementById('period') || document.getElementById('current-period');
      if (periodElem) periodElem.innerText = currentPeriod;

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

// Timer countdown
function startTimer() {
  setInterval(() => {
    const now = new Date();
    const secondsLeft = 60 - now.getSeconds();
    
    const timerElem = document.getElementById('timer') || document.getElementById('countdown');
    if (timerElem) {
      timerElem.innerText = `00:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    }

    if (secondsLeft === 59) {
      fetchGameData();
    }
  }, 1000);
}

fetchGameData();
startTimer();
