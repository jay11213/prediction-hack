# Neon Signal Lab — Telegram Mini App MVP

An original, mobile-first dark/neon prediction analytics interface. It is **not a clone** of any third-party website and contains **mock data only**.

## Included

- Telegram Mini App-compatible frontend
- User ID/password login
- Server-side password verification using bcrypt
- HttpOnly JWT session cookie
- Optional Telegram `initData` validation
- SQLite development database
- Isolated mock prediction engine
- Current period and countdown
- BIG/SMALL signal
- Two mock numbers
- Model confidence display
- History with `PENDING`, `WIN`, `LOSS`, and `JACKPOT`
- Deterministic mock result evaluation
- Clear demo disclaimer

## Requirements

- Node.js 18+
- npm
- A Telegram bot is optional for local browser testing

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open:

```text
http://localhost:3000
```

Demo login:

```text
User ID: demo_user
Password: demo_pass
```

The SQLite file is created at `data/app.sqlite`.

For automatic reload during development:

```bash
npm run dev
```

## Telegram Mini App setup

1. Create a bot with BotFather.
2. Configure a Web App URL pointing to your deployed HTTPS URL.
3. Open the app from Telegram.
4. In production set:

```env
NODE_ENV=production
REQUIRE_TELEGRAM_INIT_DATA=true
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=a_long_random_secret
```

The backend validates Telegram `initData` when `REQUIRE_TELEGRAM_INIT_DATA=true`. Do not rely on client-side validation.

For local browser testing, leave `REQUIRE_TELEGRAM_INIT_DATA=false`.

## Architecture

- `public/` — frontend UI
- `src/db.js` — persistence and user/prediction records
- `src/predictionEngine.js` — replaceable prediction/evaluation logic
- `server.js` — REST API, auth, Telegram validation, static hosting

## Important model disclaimer

The current engine is intentionally deterministic mock data. Confidence is a display value for UI testing, not a probability guarantee. If the underlying game is genuinely random, the future engine must not claim reliable prediction of server-generated outcomes.

## Production next steps

- Add admin-only user management endpoints and UI
- Use PostgreSQL
- Add rate limiting, CSRF protection, audit logs, and stronger session management
- Store Telegram user identity after validated `initData`
- Add server-side data ingestion and source verification
- Add reproducible backtesting with train/test separation
- Version model outputs and methodology
- Never present backtest confidence as a guaranteed win probability
