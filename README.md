# Adless — AI-Native Creator Video Platform

> Watch without interruptions. Contextual advertising that belongs in the scene, not between scenes.

Adless is an AI-powered creator video platform that enables creators to monetize content through context-aware product placements without interrupting the viewer experience.

---

## Phase 1 — Foundation

This phase establishes the foundational structure for Adless:
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS with a cinematic dark creator platform UI.
- **Backend**: FastAPI server with `/health` check.

### Getting Started

#### Prerequisites
- Node.js (v18+) & npm
- Python 3.10+

#### 1. Running the Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
- Health Check endpoint: [http://localhost:8000/health](http://localhost:8000/health)

#### 2. Running the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Open browser at [http://localhost:3000](http://localhost:3000)

---

## License

[MIT License](LICENSE)

---

## Single-container Railway deployment

The root `Dockerfile` builds the production Next.js application and runs Next.js on internal port 3000, FastAPI on internal port 8000, and nginx on Railway's public `$PORT`. nginx sends `/api/*` and `/health` to FastAPI and all other routes to Next.js. A guarded entrypoint stops the entire container if any critical process exits.

```bash
docker build -t adless .
docker run --rm -p 8080:8080 --env-file .env adless
```

Railway can deploy the repository directly; `railway.toml` selects the root Dockerfile and configures `/health`. Production frontend calls are same-origin and require no Railway domain in source code. See `.env.example` for variable names. Google ADC remains supported locally; Railway can receive base64-encoded service-account JSON through the `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` secret.

The official ClickHouse campaign-selection MCP bridge currently depends on a locally installed, OAuth-authenticated Codex CLI. It fails clearly when that bridge is unavailable and is not replaced by direct ClickHouse campaign ranking.
