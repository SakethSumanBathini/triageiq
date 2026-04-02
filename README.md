<div align="center">

# TriageIQ

### AI-Powered Support Email Triage System

**Stop triaging emails manually. Let AI do it in 3 seconds.**

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-triageiq--gules.vercel.app-0d4fff?style=for-the-badge)](https://triageiq-gules.vercel.app)
[![API Docs](https://img.shields.io/badge/📡%20API%20Docs-Railway%20Backend-6366f1?style=for-the-badge)](https://triageiq-api-production.up.railway.app/docs)
[![Demo Video](https://img.shields.io/badge/🎬%20Demo%20Video-YouTube-ff0000?style=for-the-badge)](https://youtu.be/-LDbUCYZQok)
[![GitHub](https://img.shields.io/badge/📁%20Source%20Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/SakethSumanBathini/triageiq)

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://python.org)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat)](LICENSE)

<br/>

> 🏆 **NxtWave AI Product Builder Accelerator — Season 1 | Problem Statement #1**
>
> Built by **Saketh Suman Bathini** · NIAT ID: N25H02B0163

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Live Links](#-live-links)
- [System Architecture](#-system-architecture)
- [AI Provider Waterfall](#-ai-provider-waterfall)
- [Business Rules Engine](#-business-rules-engine)
- [Edge Cases Handled](#-edge-cases-handled)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Local Setup](#-local-setup)
- [Project Structure](#-project-structure)
- [Key Design Decisions](#-key-design-decisions)

---

## 🔥 The Problem

A small software company receives **30–50 support emails every day** into one shared inbox. The team manually reads each one and guesses who should handle it.

The result is chaos:

| Pain Point | Impact |
|------------|--------|
| ❌ No urgency scoring | Production bugs buried under "how do I reset my password?" |
| ❌ No skill-based routing | Senior engineers answering basic how-to questions |
| ❌ No workload visibility | Overloaded teammates keep getting more tickets |
| ❌ No data | Zero insight into support patterns, response times, or team performance |

**Hours wasted. Wrong assignments. Urgent issues missed. Every single day.**

---

## ✅ The Solution

**TriageIQ** eliminates manual email triage entirely.

Paste any support email. The AI makes **6 intelligent decisions in under 3 seconds:**

```
📧 Email In  →  🧠 AI Analysis  →  📊 Dashboard Out
```

| Decision | What It Does |
|----------|-------------|
| **Category** | Bug Report / Billing / How-To / Feature Request / Account Access / Escalation / Spam |
| **Urgency** | 1–5 score based on business impact — NOT emotional tone |
| **Sentiment** | Positive / Neutral / Negative / Angry |
| **Assignee** | Best team member by skill match + current workload |
| **Confidence** | 0–100% — auto-flags uncertain cases for human review |
| **Reasoning** | Plain-English explanation of every single decision |

A **Business Rules Engine** runs ON TOP of AI — enforcing hard rules that no model can override.

---

## 🌐 Live Links

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ **Frontend App** | [triageiq-gules.vercel.app](https://triageiq-gules.vercel.app) | ✅ Live on Vercel |
| ⚙️ **Backend API** | [triageiq-api-production.up.railway.app](https://triageiq-api-production.up.railway.app) | ✅ Live on Railway |
| 📡 **API Health** | [/api/health](https://triageiq-api-production.up.railway.app/api/health) | ✅ All 4 providers healthy |
| 📖 **Swagger Docs** | [/docs](https://triageiq-api-production.up.railway.app/docs) | ✅ Interactive |
| 🎬 **Demo Video** | [YouTube Walkthrough](https://youtu.be/-LDbUCYZQok) | ✅ Full demo |
| 📁 **Source Code** | [GitHub Repository](https://github.com/SakethSumanBathini/triageiq) | ✅ Public |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React 18 Frontend                        │
│                    (Vercel · TypeScript)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Landing Page │→ │  Processing  │→ │  Results Dashboard │ │
│  │ Email Input  │  │  Animation   │  │  AI Reasoning Drawer│ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│         Tailwind CSS · Framer Motion · Recharts              │
└─────────────────────────┬───────────────────────────────────┘
                          │  REST API (JSON)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│              (Railway · Python 3.11 · Docker)                │
│                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │      AI Service         │  │   Business Rules Engine  │  │
│  │                         │  │                          │  │
│  │  1. Groq (Primary)      │  │  ✓ Keyword urgency       │  │
│  │     Llama 3.3 70B       │→ │    overrides             │  │
│  │  2. Gemini 2.5 Flash    │  │  ✓ Seniority enforcement │  │
│  │  3. OpenRouter          │  │  ✓ Workload balancing    │  │
│  │  4. NVIDIA NIMs         │  │  ✓ Confidence thresholds │  │
│  └─────────────────────────┘  └──────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         SQLite · Analytics Engine · History          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Provider Waterfall

TriageIQ never goes down. If one AI provider fails, the next takes over **automatically with zero user interruption:**

```
  Request
     │
     ▼
┌──────────────────────────────────┐
│  1️⃣  Groq · Llama 3.3 70B        │  ← Primary (fastest, ~1.8s avg)
│      console.groq.com            │
└────────────────┬─────────────────┘
                 │ Fails?
                 ▼
┌──────────────────────────────────┐
│  2️⃣  Google Gemini 2.5 Flash     │  ← Fallback 1
│      aistudio.google.com         │
└────────────────┬─────────────────┘
                 │ Fails?
                 ▼
┌──────────────────────────────────┐
│  3️⃣  OpenRouter Free Router      │  ← Fallback 2
│      openrouter.ai               │
└────────────────┬─────────────────┘
                 │ Fails?
                 ▼
┌──────────────────────────────────┐
│  4️⃣  NVIDIA NIMs · Llama 3.1 70B │  ← Fallback 3
│      build.nvidia.com            │
└────────────────┬─────────────────┘
                 │ All fail?
                 ▼
        HTTP 500 + descriptive error
```

---

## ⚖️ Business Rules Engine

The rules engine enforces decisions the AI **cannot override:**

| Rule | Trigger | Action |
|------|---------|--------|
| 🔴 **Critical Override** | 15 keywords: "production down", "server down", "all users affected"... | Force urgency → 5 regardless of AI score |
| 🔒 **Seniority Block** | Junior engineer + severity 5 ticket | Block assignment → escalate to senior automatically |
| ⚖️ **Load Balancer** | Assignee at max capacity | Skip → assign to next qualified member |
| 🚩 **Human Review Flag** | AI confidence < 70% | Flag as suggestion, require human confirmation |
| 🗑️ **Spam Filter** | 2+ spam signal keywords detected | Auto-filter, no team member assigned |

---

## 🧪 Edge Cases Handled

| # | Edge Case | How TriageIQ Handles It |
|---|-----------|------------------------|
| 1 | Email mentions both billing AND a bug | Dual-flagged — primary assigned, secondary noted in reasoning |
| 2 | Angry tone but non-urgent issue | Sentiment marked Angry, urgency NOT inflated — impact only |
| 3 | Vague one-liner: "site broken call me" | Word count < 8 → urgency 5 + mandatory human review |
| 4 | Spam or marketing email | 2+ spam indicators → auto-filtered, not routed |
| 5 | "Production down" / "server down" keywords | Rules engine forces urgency to 5, overriding AI |
| 6 | Junior engineer assigned severity 5 | Blocked → escalated to senior automatically |
| 7 | Assigned member at maximum workload | Skipped → next qualified person assigned |
| 8 | AI confidence below 70% | Flagged for mandatory human review |
| 9 | Email too short or missing context | Needs-follow-up tag + human review flag |
| 10 | Feature request disguised as a bug | AI reclassifies, alternative shown in drawer |
| 11 | Multiple issues in one email | Primary extracted, secondary noted in full reasoning |
| 12 | All 4 AI providers fail | Graceful HTTP 500 with descriptive error message |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite + TypeScript | Fast builds, type safety, modern DX |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first + fluid animations |
| **Charts** | Recharts | Analytics dashboard visualizations |
| **Backend** | FastAPI + Python 3.11 + Uvicorn | Async-first, auto-docs, blazing fast |
| **AI Primary** | Groq · Llama 3.3 70B | Fastest inference (~300 tok/s) |
| **AI Fallback 1** | Google Gemini 2.5 Flash | Strong reasoning, free tier |
| **AI Fallback 2** | OpenRouter Free Router | Multi-model flexibility |
| **AI Fallback 3** | NVIDIA NIMs · Llama 3.1 70B | GPU-optimized inference |
| **Database** | SQLite + aiosqlite | Zero-config, async-compatible |
| **Validation** | Pydantic v2 | Runtime type safety |
| **Container** | Docker (Python 3.11-slim) | Reproducible builds |
| **Frontend Deploy** | Vercel | Instant global CDN |
| **Backend Deploy** | Railway | Docker-native, always-on |

---

## 📡 API Reference

### Base URL
```
https://triageiq-api-production.up.railway.app
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/triage` | Triage a single email |
| `POST` | `/api/triage/batch` | Triage up to 20 emails at once |
| `GET` | `/api/team` | Team roster with current workload |
| `GET` | `/api/analytics` | Aggregated triage statistics |
| `GET` | `/api/samples` | 10 pre-built realistic demo emails |
| `GET` | `/api/health` | Health check + all 4 provider status |
| `GET` | `/docs` | Interactive Swagger UI |

### Example Request

```bash
curl -X POST https://triageiq-api-production.up.railway.app/api/triage \
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
    "reasoning": "Production outage with active revenue loss and 500 users affected. Critical keyword override applied. Immediate escalation required.",
    "key_issues": ["production outage", "500 users affected", "revenue loss"],
    "suggested_response_time": "Immediate",
    "requires_human_review": false,
    "detected_keywords": ["production down", "revenue loss"]
  },
  "assignment": {
    "assignee": {
      "name": "Arjun Patel",
      "role": "DevOps Lead",
      "current_load": 3
    },
    "assignment_reason": "Senior engineer — DevOps skill match, urgency 5 escalation, workload within limits",
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

## 🚀 Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- At least one free API key — [Groq](https://console.groq.com) recommended (free, instant signup)

### 1. Clone the repo

```bash
git clone https://github.com/SakethSumanBathini/triageiq.git
cd triageiq
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn app.main:app --reload
# ✅ API running at http://localhost:8000
# ✅ Swagger docs at http://localhost:8000/docs
```

### 3. Frontend setup

```bash
cd frontend
npm install
# Create frontend/.env.local:
# VITE_API_URL=http://localhost:8000
npm run dev
# ✅ App running at http://localhost:5173
```

### 4. Environment Variables

```env
# backend/.env

# Required — free at console.groq.com
GROQ_API_KEY=gsk_your_key_here

# Optional fallbacks (strongly recommended)
GEMINI_API_KEY=AIza...           # aistudio.google.com
OPENROUTER_API_KEY=sk-or-v1-... # openrouter.ai
NVIDIA_API_KEY=nvapi-...         # build.nvidia.com

# App config
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

---

## 📁 Project Structure

```
triageiq/
│
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── main.py                  # FastAPI app entry + CORS
│   │   ├── 📂 routes/
│   │   │   └── triage.py            # All 7 API endpoints
│   │   ├── 📂 services/
│   │   │   ├── ai_service.py        # 4-provider AI waterfall
│   │   │   └── rules_engine.py      # Business rules + routing
│   │   ├── 📂 models/
│   │   │   └── schemas.py           # Pydantic v2 data models
│   │   ├── 📂 db/
│   │   │   └── database.py          # SQLite + analytics engine
│   │   └── 📂 data/
│   │       ├── team_roster.json     # 5 team members with skills
│   │       └── sample_emails.json   # 10 realistic demo emails
│   ├── requirements.txt
│   └── .env.example
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── App.tsx                  # Root view state machine
│   │   ├── 📂 components/
│   │   │   ├── 📂 EmailInput/       # Landing page + email form
│   │   │   ├── 📂 Processing/       # AI processing animation
│   │   │   ├── 📂 Dashboard/        # Results grid + analytics
│   │   │   └── 📂 EmailDetail/      # AI reasoning drawer
│   │   ├── 📂 types/
│   │   │   └── index.ts             # All TypeScript interfaces
│   │   └── 📂 lib/
│   │       └── api.ts               # Axios API client
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── Dockerfile                       # Python 3.11-slim container
├── railway.json                     # Railway deployment config
├── .gitignore                       # API keys protected ✅
└── README.md
```

---

## 💡 Key Design Decisions

**Why a 4-provider AI waterfall?**
No single free AI provider guarantees 100% uptime. The waterfall ensures the product never fails due to a provider outage — critical for a live support tool.

**Why a rules engine ON TOP of AI?**
AI is probabilistic. Business rules are deterministic. "A junior engineer cannot handle a P5 production outage" is not a suggestion — it's a hard rule. The combination gives AI's intelligence with engineering's reliability.

**Why confidence scoring?**
A triage system that is uncertain but doesn't tell you is dangerous. TriageIQ surfaces its own uncertainty and hands ambiguous cases back to humans — the right behavior for any production support tool.

**Why SQLite?**
Zero-config, async-compatible via aiosqlite, and perfectly sufficient for the analytics workload in a demo/MVP context. Easily swappable for PostgreSQL in production.

---

## 📊 What the Dashboard Shows

- 🔴 **Urgency heatmap** — all emails sorted by business priority at a glance
- 👤 **Team workload** — who has capacity, who is overloaded
- 📈 **Category distribution** — pie chart of issue types over time
- ⏱️ **Processing speed** — average AI response time per provider
- 🚩 **Human review queue** — flagged emails requiring manual attention
- 🧠 **AI reasoning drawer** — full plain-English explanation for every decision

---

<div align="center">

---

**Built with ❤️ by Saketh Suman Bathini**

*NxtWave AI Product Builder Accelerator — Season 1*

[![Try It Live](https://img.shields.io/badge/Try%20It%20Live-triageiq--gules.vercel.app-0d4fff?style=for-the-badge)](https://triageiq-gules.vercel.app)

---

</div>
