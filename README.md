# TriageIQ — AI-Powered Support Email Triage System

<div align="center">

![TriageIQ](https://img.shields.io/badge/TriageIQ-AI%20Email%20Intelligence-00d4ff?style=for-the-badge)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange?style=flat)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**NxtGig AI Product Builder Accelerator — Season 1 | Problem Statement #1**

[Live Demo](https://triageiq-gules.vercel.app) · [API Docs](https://triageiq-api-production.up.railway.app/docs) · [Video Walkthrough](#)

</div>

---

## The Problem

A small software company receives **30–50 support emails every day** into one shared inbox. Someone manually reads each email and decides who handles it. The result:

- Senior engineers waste hours on basic how-to questions
- Urgent production bugs wait unread with no priority signal
- No data on team workload, response patterns, or support trends
- Wrong assignments happen constantly — no skill-based routing

**TriageIQ eliminates this entirely.**

---

## What TriageIQ Does

Paste any support email. The AI makes **6 decisions in under 3 seconds:**

| Decision       | What it does                                                                         |
| -------------- | ------------------------------------------------------------------------------------ |
| **Category**   | Bug Report / Billing / How-To / Feature Request / Account Access / Escalation / Spam |
| **Urgency**    | 1–5 score based on business impact, not emotional tone                               |
| **Sentiment**  | Positive / Neutral / Negative / Angry                                                |
| **Assignee**   | Best team member by skill match + current workload                                   |
| **Confidence** | 0–100% — flags uncertain cases for human review                                      |
| **Reasoning**  | Plain-English explanation of every decision                                          |

A **business rules engine** runs on top of AI to enforce hard rules — critical keywords override urgency scores, junior engineers cannot receive severity-5 tickets, overloaded members are automatically skipped.

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend                      │
│   Landing → Processing → Dashboard → Drawer     │
│   Tailwind CSS · Framer Motion · Recharts        │
└──────────────────┬──────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────┐
│              FastAPI Backend                     │
│                                                  │
│  ┌─────────────────┐   ┌──────────────────────┐ │
│  │   AI Service    │   │   Rules Engine       │ │
│  │                 │   │                      │ │
│  │ 1. Groq         │──▶│ • Keyword overrides  │ │
│  │ 2. Gemini       │   │ • Seniority blocks   │ │
│  │ 3. OpenRouter   │   │ • Workload balance   │ │
│  │ 4. NVIDIA NIMs  │   │ • Confidence flags   │ │
│  └─────────────────┘   └──────────────────────┘ │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │      SQLite · Analytics · History         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Frontend        | React 18 + Vite + TypeScript    |
| Styling         | Tailwind CSS + Framer Motion    |
| Charts          | Recharts                        |
| Backend         | FastAPI (Python 3.11) + Uvicorn |
| AI — Primary    | Groq · Llama 3.3 70B            |
| AI — Fallback 1 | Google Gemini 2.5 Flash         |
| AI — Fallback 2 | OpenRouter Free Router          |
| AI — Fallback 3 | NVIDIA NIMs · Llama 3.1 70B     |
| Database        | SQLite + aiosqlite              |
| Validation      | Pydantic v2                     |
| Frontend Deploy | Vercel                          |
| Backend Deploy  | Render                          |

---

## Edge Cases Handled

| #   | Edge Case                                  | Handling                                        |
| --- | ------------------------------------------ | ----------------------------------------------- |
| 1   | Email has both billing AND bug symptoms    | Dual-flagged, primary assigned, secondary noted |
| 2   | Angry tone but non-urgent issue            | Sentiment logged, urgency NOT inflated          |
| 3   | Vague one-liner like "site broken call me" | Word count < 8 → urgency 5 + human review       |
| 4   | Spam or marketing email                    | 2+ spam indicators → auto-filtered, not routed  |
| 5   | "Production down" keywords detected        | Rules engine overrides AI → urgency 5           |
| 6   | Junior engineer + urgency 5 ticket         | Blocked, escalated to senior automatically      |
| 7   | Overloaded assignee                        | Skipped, next qualified person assigned         |
| 8   | AI confidence below 70%                    | Flagged for human review, routed as suggestion  |
| 9   | Email too short or no context              | Needs-follow-up tag + human review flag         |
| 10  | Feature request disguised as bug           | Reclassified, alternative shown in drawer       |
| 11  | Multiple issues in one email               | Primary extracted, secondary in reasoning       |
| 12  | All 4 AI providers fail                    | Graceful HTTP 500 with descriptive error        |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- At least one free API key (Groq recommended — console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/triageiq.git
cd triageiq
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and paste your API keys
uvicorn app.main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
# App running at http://localhost:5173
```

### 4. Environment Variables

Create `backend/.env` by copying `backend/.env.example`:

```env
# Primary — required (free at console.groq.com)
GROQ_API_KEY=gsk_your_key_here

# Fallbacks — optional but recommended
GEMINI_API_KEY=AIza...           # aistudio.google.com
OPENROUTER_API_KEY=sk-or-v1-... # openrouter.ai
NVIDIA_API_KEY=nvapi-...         # build.nvidia.com

# App config
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

---

## API Reference

| Method | Endpoint            | Description                           |
| ------ | ------------------- | ------------------------------------- |
| `POST` | `/api/triage`       | Triage a single email                 |
| `POST` | `/api/triage/batch` | Triage up to 20 emails at once        |
| `GET`  | `/api/team`         | Team roster with current workload     |
| `GET`  | `/api/analytics`    | Aggregated triage statistics          |
| `GET`  | `/api/samples`      | 10 pre-built realistic demo emails    |
| `GET`  | `/api/health`       | Health check + configured providers   |
| `GET`  | `/docs`             | Interactive Swagger API documentation |

### Example Request

```bash
curl -X POST http://localhost:8000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "URGENT: Production server completely down",
    "body": "Our server has been down for 30 minutes. 500 users affected. Revenue loss ongoing.",
    "sender": "cto@company.com",
    "sender_name": "John Smith"
  }'
```

### Example Response

```json
{
  "id": "A3F9B2",
  "ai_result": {
    "category": "Bug Report",
    "urgency": 5,
    "sentiment": "Angry",
    "confidence": 0.97,
    "reasoning": "Production outage with active revenue loss and 500 users affected. Critical keyword override applied.",
    "key_issues": ["production outage", "500 users affected", "revenue loss"],
    "suggested_response_time": "Immediate",
    "requires_human_review": false,
    "detected_keywords": ["production down", "revenue loss"]
  },
  "assignment": {
    "assignee": {
      "name": "Arjun Patel",
      "role": "DevOps Lead"
    },
    "assignment_reason": "Senior engineer — skill match for Bug Report, urgency 5 critical escalation",
    "escalated": true,
    "rule_overrides": [
      "Urgency overridden to 5: critical keyword 'production down' detected"
    ]
  },
  "provider_used": "Groq (Llama 3.3 70B)",
  "processing_time_ms": 1842
}
```

---

## Deployment

### Backend → Render (Free)

1. Push repo to GitHub (make sure `.env` is in `.gitignore` ✅)
2. Go to **render.com** → New Web Service → connect repo
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add env variables in Render dashboard (your 4 API keys)
7. Copy your URL e.g. `https://triageiq-api-production.up.railway.app`

### Frontend → Vercel (Free)

1. Go to **vercel.com** → New Project → import repo
2. Root directory: `frontend`
3. Add env variable: `VITE_API_URL=https://triageiq-api-production.up.railway.app`
4. Deploy → copy live URL

---

## Project Structure

```
triageiq/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry + CORS config
│   │   ├── routes/triage.py        # All API endpoints
│   │   ├── services/
│   │   │   ├── ai_service.py       # 4-provider AI fallback chain
│   │   │   └── rules_engine.py     # Business rules + team routing
│   │   ├── models/schemas.py       # Pydantic data models
│   │   ├── db/database.py          # SQLite + analytics
│   │   └── data/
│   │       ├── team_roster.json    # 5 team members with skills
│   │       └── sample_emails.json  # 10 realistic demo emails
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Root — view state management
│   │   ├── components/
│   │   │   ├── EmailInput/         # Landing page + email form
│   │   │   ├── Processing/         # AI thinking animation screen
│   │   │   ├── Dashboard/          # Results + analytics charts
│   │   │   └── EmailDetail/        # Full AI reasoning drawer
│   │   ├── types/index.ts          # All TypeScript interfaces
│   │   └── lib/api.ts              # API client + utility helpers
│   └── package.json
├── railway.json                 # Railway deployment config
├── .gitignore                      # Protects .env and secrets
└── README.md
```

---

## Submission Sections

### Section 1 — Problem Understanding

A small software company receives 30–50 customer support emails daily into a single shared inbox. The team manually reads each email and decides who handles it — wasting hours, causing wrong assignments, and missing urgent issues entirely. Senior engineers answer basic how-to questions while critical bugs wait unread.

**Target users:** Support team managers at small SaaS companies (5–15 people) with no dedicated triage workflow.

**Success:** Zero manual triage. Every email classified, scored, and assigned in under 3 seconds. One dashboard shows the team their full priority queue.

---

### Section 2 — Cases, Logic & Constraints

**Inputs:** Email subject (required), body (required), sender name and email (optional). Batch up to 20 emails.

**Categories:** Bug Report, Billing, How-To, Feature Request, Account Access, Escalation, Spam, General Inquiry

**Urgency scale:** 1–5 based on business impact (not emotional tone)

**12 edge cases handled:** See table above.

**Failure handling:** 4-provider AI fallback chain. If all fail, HTTP 500 with descriptive error. If confidence < 70%, flagged for human review. If no skill match found, least-loaded available member assigned with warning.

---

_Built by Saketh Suman Bathini for NxtGig AI Product Builder Accelerator Season 1_
