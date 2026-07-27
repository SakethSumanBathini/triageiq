from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routes.triage import router
from app.db.database import init_db

app = FastAPI(
    title="TriageIQ API",
    description="AI-Powered Support Email Triage System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Comma-separated allowlist. Fail closed to localhost when unset/empty.
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
if not origins:
    origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✅ TriageIQ API started")
    print(f"📖 Docs: http://localhost:8000/docs")


@app.get("/")
async def root():
    return {
        "service": "TriageIQ",
        "tagline": "AI-Powered Support Email Intelligence",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
