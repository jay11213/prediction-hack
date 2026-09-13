let currentPeriod = "";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginView = document.getElementById("loginView");
  const dashboardView = document.getElementById("dashboardView");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userId = document.getElementById("userId").value.trim();
      const password = document.getElementById("password").value.trim();

      if ((userId === "demo_user" || userId === "demo") && (password === "demo_pass" || password === "demo")) {
        loginView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        if (loginError) loginError.innerText = "";
        
        fetchGameData();
        startTimer();
      } else {
        if (loginError) loginError.innerText = "Invalid User ID or Password";
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      dashboardView.classList.add("hidden");
      loginView.classList.remove("hidden");
    });
  }
});

// Fetch live game data
async function fetchGameData() {
  try {
    const response = await fetch('/api/game-data');
    const result = await response.json();
    
    if (result && result.data && result.data.length > 0) {
      const latest = result.data[0];
      const latestIssue = BigInt(latest.issueNumber);
      currentPeriod = (latestIssue + 1n).toString();
      
      const periodElem = document.getElementById('period');
      if (periodElem) periodElem.innerText = currentPeriod;

      updatePredictionSignal(latest);
      renderHistory(result.data);
    }
  } catch (err) {
    console.error("Error fetching game data:", err);
  }
}

function updatePredictionSignal(latestItem) {
  const num = parseInt(latestItem.number, 10);
  const predType = num >= 5 ? "BIG" : "SMALL";
  
  const predElem = document.getElementById('predictionType');
  const confElem = document.getElementById('confidence');
  
  if (predElem) predElem.innerText = predType;
  if (confElem) confElem.innerText = `${85 + (num % 10)}%`;
}

function renderHistory(historyData) {
  const historyBody = document.getElementById('historyBody');
  if (!historyBody) return;

  historyBody.innerHTML = historyData.slice(0, 10).map(item => {
    const num = parseInt(item.number, 10);
    const resultType = num >= 5 ? 'BIG' : 'SMALL';
    const statusClass = num >= 5 ? 'win' : 'loss';

    return `
      <tr>
        <td>${item.issueNumber}</td>
        <td>${item.number} (${resultType})</td>
        <td>${resultType}</td>
        <td><span class="status ${statusClass}">${resultType === 'BIG' ? 'WIN' : 'LOSS'}</span></td>
      </tr>
    `;
  }).join('');
}

// Synchronized 60-second timer
function startTimer() {
  setInterval(() => {
    const now = new Date();
    const secondsLeft = 60 - now.getSeconds();
    
    const timerElem = document.getElementById('countdown');
    if (timerElem) {
      timerElem.innerText = `00:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    }

    if (secondsLeft === 59) {
      fetchGameData();
    }
  }, 1000);
}

fetchGameData();
