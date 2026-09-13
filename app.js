const $ = (id) => document.getElementById(id);
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

let countdown = 0;
let timerHandle;

function show(view) {
  $("loginView").classList.toggle("hidden", view !== "login");
  $("dashboardView").classList.toggle("hidden", view !== "dashboard");
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("loginError").textContent = "";
  try {
    await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        userId: $("userId").value,
        password: $("password").value,
        telegramInitData: tg?.initData || ""
      })
    });
    show("dashboard");
    await loadDashboard();
  } catch (error) {
    $("loginError").textContent = error.message;
  }
});

$("logoutBtn").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  clearInterval(timerHandle);
  show("login");
});

function render(data) {
  $("winRate").textContent = `${data.stats.winRate}%`;
  $("jackpots").textContent = data.stats.jackpots;
  $("total").textContent = data.stats.total;
  $("period").textContent = data.current.period;
  $("predictionType").textContent = data.current.prediction.type;
  $("confidence").textContent = `${data.current.prediction.confidence}%`;
  $("confirmation").textContent = data.current.prediction.confirmation;
  $("numbers").innerHTML = data.current.prediction.numbers
    .map(n => `<div class="number">${n}</div>`).join("");

  $("historyBody").innerHTML = data.history.map(row => `
    <tr>
      <td>${row.period}</td>
      <td>${row.actualResult ?? "—"}</td>
      <td>${row.predictedType}</td>
      <td class="status-${row.status}">${row.status === "WIN" ? "WIN ✓" : row.status === "JACKPOT" ? "JACKPOT ★" : row.status === "LOSS" ? "LOSS" : "PENDING"}</td>
    </tr>
  `).join("");

  countdown = data.current.countdown;
  updateTimer();
}

function updateTimer() {
  const safe = Math.max(0, countdown);
  $("countdown").textContent = `00:${String(safe).padStart(2, "0")}`;
}
function startTimer() {
  clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    countdown -= 1;
    if (countdown <= 0) loadDashboard();
    updateTimer();
  }, 1000);
}
async function loadDashboard() {
  try {
    const data = await api("/api/dashboard");
    render(data);
    startTimer();
  } catch (error) {
    if (error.message.includes("authenticated") || error.message.includes("Session")) show("login");
    console.error(error);
  }
}

(async function boot() {
  try {
    await api("/api/me");
    show("dashboard");
    await loadDashboard();
  } catch {
    show("login");
  }
})();
