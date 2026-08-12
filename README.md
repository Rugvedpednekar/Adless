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
