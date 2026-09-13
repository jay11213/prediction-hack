const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 8080;

const sessions = new Set();

function send(res, status, data, type = "application/json") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*"
  });
  res.end(type === "application/json" ? JSON.stringify(data) : data);
}

function jsonBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { resolve({}); }
    });
  });
}

function isAuthenticated(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/session=([^;]+)/);
  return match && sessions.has(match[1]);
}

function dashboard() {
  return {
    stats: {
      winRate: 68,
      jackpots: 3,
      total: 25
    },
    current: {
      period: String(Date.now()),
      countdown: 30,
      prediction: {
        type: "BIG",
        numbers: [7, 4],
        confidence: 82,
        confirmation: "Demo signal only — not a guaranteed prediction"
      }
    },
    history: []
  };
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/auth/login" && req.method === "POST") {
    const body = await jsonBody(req);

    if (body.userId === "demo_user" && body.password === "demo_pass") {
      const token = crypto.randomBytes(24).toString("hex");
      sessions.add(token);

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `session=${token}; HttpOnly; SameSite=Lax; Path=/`
      });
      return res.end(JSON.stringify({ ok: true }));
    }

    return send(res, 401, { error: "Invalid user ID or password" });
  }

  if (req.url === "/api/me") {
    return isAuthenticated(req)
      ? send(res, 200, { authenticated: true })
      : send(res, 401, { error: "Not authenticated" });
  }

  if (req.url === "/api/dashboard") {
    return isAuthenticated(req)
      ? send(res, 200, dashboard())
      : send(res, 401, { error: "Session not authenticated" });
  }

  if (req.url === "/api/auth/logout" && req.method === "POST") {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/session=([^;]+)/);
    if (match) sessions.delete(match[1]);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "session=; Max-Age=0; Path=/"
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(__dirname, filePath);

  if (!filePath.startsWith(__dirname)) {
    return send(res, 403, { error: "Forbidden" });
  }

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, { error: "Not found" });

    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript"
    };

    send(res, 200, data, types[ext] || "text/plain");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
