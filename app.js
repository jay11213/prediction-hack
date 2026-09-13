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
    const resData = await response.json();

    // Flexible extraction to catch data across various WinGo API formats
    let list = [];
    if (Array.isArray(resData)) {
      list = resData;
    } else if (resData && Array.isArray(resData.data)) {
      list = resData.data;
    } else if (resData && resData.data && Array.isArray(resData.data.list)) {
      list = resData.data.list;
    } else if (resData && Array.isArray(resData.list)) {
      list = resData.list;
    }

    if (list.length > 0) {
      const latest = list[0];
      const issueStr = latest.issueNumber || latest.period || latest.issue;
      
      if (issueStr) {
        const latestIssue = BigInt(issueStr);
        currentPeriod = (latestIssue + 1n).toString();
        const periodElem = document.getElementById('period');
        if (periodElem) periodElem.innerText = currentPeriod;
      }

      updatePredictionSignal(latest);
      renderHistory(list);
    }
  } catch (err) {
    console.error("Error fetching game data:", err);
  }
}

function updatePredictionSignal(latestItem) {
  const rawNum = latestItem.number !== undefined ? latestItem.number : latestItem.result;
  const num = parseInt(rawNum, 10);
  
  if (isNaN(num)) return;

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
    const issue = item.issueNumber || item.period || item.issue || "—";
    const rawNum = item.number !== undefined ? item.number : item.result;
    const num = parseInt(rawNum, 10);
    const resultType = isNaN(num) ? "—" : (num >= 5 ? 'BIG' : 'SMALL');
    const statusClass = resultType === 'BIG' ? 'win' : 'loss';

    return `
      <tr>
        <td>${issue}</td>
        <td>${rawNum !== undefined ? rawNum : '—'} (${resultType})</td>
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
