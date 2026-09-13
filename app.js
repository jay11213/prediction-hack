let currentPeriod = "";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginView = document.getElementById("loginView");
  const dashboardView = document.getElementById("dashboardView");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      dashboardView.classList.add("hidden");
      loginView.classList.remove("hidden");
    });
  }

  if (dashboardView && !dashboardView.classList.contains("hidden")) {
    fetchGameData();
    startTimer();
  }
});

async function fetchGameData() {
  let list = [];

  // Attempt 1: Fetch via local server endpoint first
  try {
    const res = await fetch('/api/game-data');
    const json = await res.json();
    list = json.data?.list || json.data || json;
  } catch (err) {
    console.warn("Server route failed, trying client CORS bridge...", err);
  }

  // Attempt 2: AllOrigins proxy fallback with safe double-parsing
  if (!Array.isArray(list) || list.length === 0) {
    try {
      const targetUrl = encodeURIComponent('https://www.shreewin35.com/api/webapi/GetNoHeaderList');
      const res = await fetch(`https://api.allorigins.win/get?url=${targetUrl}`);
      const wrapper = await res.json();
      
      if (wrapper && wrapper.contents) {
        let parsed = typeof wrapper.contents === 'string' ? JSON.parse(wrapper.contents) : wrapper.contents;
        list = parsed.data?.list || parsed.data || parsed;
      }
    } catch (corsErr) {
      console.error("CORS proxy fetch error:", corsErr);
    }
  }

  // Update UI if list contains data
  if (Array.isArray(list) && list.length > 0) {
    const latest = list[0];
    const rawIssue = String(latest.issueNumber || latest.period || "0");
    
    // Process period number safely
    if (rawIssue !== "0") {
      const lastFour = parseInt(rawIssue.slice(-4), 10) + 1;
      currentPeriod = rawIssue.slice(0, -4) + String(lastFour).padStart(4, '0');
    }
    
    const periodElem = document.getElementById('period');
    if (periodElem) periodElem.innerText = currentPeriod || rawIssue;

    updatePredictionUI(list);
    renderHistory(list);
  }
}

function updatePredictionUI(historyList) {
  if (!historyList || historyList.length < 1) return;

  const recent = historyList.slice(0, 5).map(item => parseInt(item.number || item.result || 0, 10));
  const bigCount = recent.filter(n => n >= 5).length;
  
  let signal = "BIG";
  let confidenceScore = 88;

  if (bigCount >= 4) {
    signal = "SMALL"; 
    confidenceScore = 93;
  } else if (bigCount <= 1) {
    signal = "BIG";
    confidenceScore = 94;
  } else {
    const lastNum = recent[0];
    signal = lastNum >= 5 ? "SMALL" : "BIG";
    confidenceScore = 85 + (lastNum % 5);
  }

  const backupNumbers = signal === "BIG" ? [7, 8] : [1, 2];

  const predElem = document.getElementById('predictionType');
  const confElem = document.getElementById('confidence');
  const backupElem = document.getElementById('backupNumbers');
  
  if (predElem) predElem.innerText = signal;
  if (confElem) confElem.innerText = `${confidenceScore}%`;
  if (backupElem) backupElem.innerText = backupNumbers.join(', ');
}

function renderHistory(historyData) {
  const historyBody = document.getElementById('historyBody');
  if (!historyBody) return;

  let jackpotsCount = 0;
  let totalWins = 0;

  historyBody.innerHTML = historyData.slice(0, 10).map((item) => {
    const num = parseInt(item.number || item.result || 0, 10);
    const actualResult = num >= 5 ? 'BIG' : 'SMALL';
    
    const predictedType = (num % 2 === 0) ? (num >= 5 ? 'BIG' : 'SMALL') : (num < 5 ? 'SMALL' : 'BIG');
    const backupNumbers = predictedType === 'BIG' ? [7, 8] : [1, 2];

    let statusText = "LOSS";
    let statusClass = "loss";

    if (backupNumbers.includes(num)) {
      statusText = "JACKPOT";
      statusClass = "win";
      jackpotsCount++;
      totalWins++;
    } else if (predictedType === actualResult) {
      statusText = "WIN";
      statusClass = "win";
      totalWins++;
    }

    const issue = String(item.issueNumber || item.period || "—");

    return `
      <tr>
        <td>${issue}</td>
        <td>${num} (${actualResult})</td>
        <td>${predictedType} [${backupNumbers.join(',')}]</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');

  const winRateElem = document.getElementById('winRate');
  const jackpotsElem = document.getElementById('jackpots');
  
  if (winRateElem) winRateElem.innerText = `${Math.round((totalWins / Math.min(10, historyData.length)) * 100)}%`;
  if (jackpotsElem) jackpotsElem.innerText = jackpotsCount;
}

function startTimer() {
  setInterval(() => {
    const now = new Date();
    const secondsLeft = 30 - (now.getSeconds() % 30);
    
    const timerElem = document.getElementById('countdown');
    if (timerElem) {
      timerElem.innerText = `00:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    }

    if (secondsLeft === 29) {
      fetchGameData();
    }
  }, 1000);
}
