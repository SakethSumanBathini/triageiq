import json
import time
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    EmailInput, BatchEmailInput, TriageResponse,
    BatchTriageResponse, TeamRosterResponse, AnalyticsResponse
)
from app.services.ai_service import triage_email
from app.services.rules_engine import apply_rules, assign_team_member, load_team
from app.db.database import save_result, get_analytics
import os

router = APIRouter(prefix="/api", tags=["triage"])


@router.post("/triage", response_model=TriageResponse)
async def triage_single_email(email: EmailInput):
    """Triage a single support email with AI + rules engine."""
    start_time = time.time()
    try:
        # Step 1: AI classification
        ai_result, provider = await triage_email(email)

        # Step 2: Apply business rules on top
        ai_result = apply_rules(email, ai_result)

        # Step 3: Smart team assignment
        team = load_team()
        assignment = assign_team_member(ai_result, team)

        processing_ms = round((time.time() - start_time) * 1000, 2)
        result_id = str(uuid.uuid4())[:8].upper()
        timestamp = datetime.utcnow().isoformat()

        # Save to DB
        await save_result({
            "id": result_id,
            "subject": email.subject,
            "sender": email.sender,
            "category": ai_result.category.value,
            "urgency": ai_result.urgency.value,
            "sentiment": ai_result.sentiment.value,
            "confidence": ai_result.confidence,
            "assignee_name": assignment.assignee.name,
            "assignee_role": assignment.assignee.role,
            "provider_used": provider,
            "processing_time_ms": processing_ms,
            "requires_human_review": int(ai_result.requires_human_review),
            "is_spam": int(ai_result.is_spam),
            "timestamp": timestamp
        })

        return TriageResponse(
            id=result_id,
            email=email,
            ai_result=ai_result,
            assignment=assignment,
            provider_used=provider,
            processing_time_ms=processing_ms,
            timestamp=timestamp
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/triage/batch", response_model=BatchTriageResponse)
async def triage_batch_emails(batch: BatchEmailInput):
    """Triage multiple emails at once (max 20)."""
    start_time = time.time()
    results = []
    provider_used = "Unknown"

    for email in batch.emails:
        try:
            ai_result, provider = await triage_email(email)
            provider_used = provider
            ai_result = apply_rules(email, ai_result)
            team = load_team()
            assignment = assign_team_member(ai_result, team)
            processing_ms = round((time.time() - start_time) * 1000, 2)
            result_id = str(uuid.uuid4())[:8].upper()
            timestamp = datetime.utcnow().isoformat()

            await save_result({
                "id": result_id,
                "subject": email.subject,
                "sender": email.sender,
                "category": ai_result.category.value,
                "urgency": ai_result.urgency.value,
                "sentiment": ai_result.sentiment.value,
                "confidence": ai_result.confidence,
                "assignee_name": assignment.assignee.name,
                "assignee_role": assignment.assignee.role,
                "provider_used": provider,
                "processing_time_ms": processing_ms,
                "requires_human_review": int(ai_result.requires_human_review),
                "is_spam": int(ai_result.is_spam),
                "timestamp": timestamp
            })

            results.append(TriageResponse(
                id=result_id,
                email=email,
                ai_result=ai_result,
                assignment=assignment,
                provider_used=provider,
                processing_time_ms=processing_ms,
                timestamp=timestamp
            ))
        except Exception as e:
            print(f"Failed to process email '{email.subject}': {e}")
            continue

    total_ms = round((time.time() - start_time) * 1000, 2)
    high_urgency = sum(1 for r in results if r.ai_result.urgency.value >= 4)
    human_review = sum(1 for r in results if r.ai_result.requires_human_review)

    return BatchTriageResponse(
        results=results,
        total_processed=len(results),
        high_urgency_count=high_urgency,
        human_review_count=human_review,
        provider_used=provider_used,
        total_processing_time_ms=total_ms
    )


@router.get("/team", response_model=TeamRosterResponse)
async def get_team_roster():
    """Get current team roster with workload."""
    team = load_team()
    return TeamRosterResponse(members=team)


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics_data():
    """Get aggregated analytics from all processed emails."""
    data = await get_analytics()
    return AnalyticsResponse(**data)


@router.get("/samples")
async def get_sample_emails():
    """Return pre-built realistic sample emails for demo."""
    data_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "sample_emails.json"
    )
    with open(data_path) as f:
        return json.load(f)


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    configured_providers = []
    if os.getenv("GROQ_API_KEY"):
        configured_providers.append("Groq")
    if os.getenv("GEMINI_API_KEY"):
        configured_providers.append("Gemini")
    if os.getenv("OPENROUTER_API_KEY"):
        configured_providers.append("OpenRouter")
    if os.getenv("NVIDIA_API_KEY"):
        configured_providers.append("NVIDIA NIMs")

    return {
        "status": "healthy",
        "service": "TriageIQ API",
        "version": "1.0.0",
        "configured_providers": configured_providers,
        "provider_count": len(configured_providers)
    }
