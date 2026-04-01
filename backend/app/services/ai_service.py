import os
import json
import time
import httpx
from typing import Optional
from groq import AsyncGroq
from app.models.schemas import (
    EmailInput, AITriageResult, EmailCategory,
    UrgencyLevel, Sentiment
)

TRIAGE_SYSTEM_PROMPT = """You are TriageIQ, an expert AI support email analyst for a software company.

Your job is to analyze customer support emails and return a structured JSON triage decision.

You must analyze:
1. EMAIL CATEGORY - what type of issue is this?
2. URGENCY - how urgent is this on a scale of 1-5?
3. SENTIMENT - what is the customer's emotional state?
4. CONFIDENCE - how confident are you in your analysis (0.0 to 1.0)?
5. REASONING - explain your decisions clearly
6. KEY ISSUES - list the specific problems mentioned
7. RESPONSE TIME - how quickly should this be addressed?
8. REQUIRES HUMAN REVIEW - flag if uncertain or complex

URGENCY SCALE:
1 = Very Low (general questions, no time pressure)
2 = Low (minor issues, customer not distressed)
3 = Medium (functionality impaired, customer waiting)
4 = High (significant impact, customer frustrated)
5 = Critical (production down, revenue impact, CTO/CEO involved)

CRITICAL RULES:
- "production down", "server down", "all users affected", "revenue loss" → ALWAYS urgency 5
- Spam/marketing emails → category SPAM, urgency 1, is_spam=true
- Vague emails with very little info → requires_human_review=true
- If email has BOTH billing AND bug issues → pick primary, note secondary in reasoning
- Do NOT inflate urgency just because customer uses angry language
- Urgency is about BUSINESS IMPACT, not emotional tone

Return ONLY valid JSON matching this exact schema - no markdown, no extra text:
{
  "category": "Bug Report|Billing|How-To|Feature Request|Account Access|Escalation|Spam|General Inquiry",
  "urgency": 1-5,
  "sentiment": "Positive|Neutral|Negative|Angry",
  "confidence": 0.0-1.0,
  "reasoning": "Clear explanation of your classification decision",
  "key_issues": ["issue1", "issue2"],
  "suggested_response_time": "Immediate|Within 1 hour|Within 4 hours|Within 24 hours|Within 48 hours",
  "alternative_category": null or "category name",
  "requires_human_review": true/false,
  "human_review_reason": null or "reason string",
  "is_spam": true/false,
  "is_duplicate": false,
  "detected_keywords": ["keyword1", "keyword2"]
}"""


def build_email_prompt(email: EmailInput) -> str:
    return f"""Analyze this support email:

FROM: {email.sender_name} <{email.sender}>
SUBJECT: {email.subject}
BODY:
{email.body}

Return only the JSON triage decision."""


async def call_groq(email: EmailInput) -> tuple[AITriageResult, str]:
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
            {"role": "user", "content": build_email_prompt(email)}
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_tokens=1000
    )
    raw = json.loads(response.choices[0].message.content)
    return parse_ai_response(raw), "Groq (Llama 3.3 70B)"


async def call_gemini(email: EmailInput) -> tuple[AITriageResult, str]:
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": TRIAGE_SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": build_email_prompt(email)}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        raw = json.loads(raw_text)
        return parse_ai_response(raw), "Gemini 2.5 Flash"


async def call_openrouter(email: EmailInput) -> tuple[AITriageResult, str]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-Title": "TriageIQ"
    }
    payload = {
        "model": "meta-llama/llama-3.3-70b-instruct:free",
        "messages": [
            {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
            {"role": "user", "content": build_email_prompt(email)}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        raw = json.loads(data["choices"][0]["message"]["content"])
        return parse_ai_response(raw), "OpenRouter (Llama 3.3 70B)"


async def call_nvidia(email: EmailInput) -> tuple[AITriageResult, str]:
    api_key = os.getenv("NVIDIA_API_KEY")
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "meta/llama-3.1-70b-instruct",
        "messages": [
            {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
            {"role": "user", "content": build_email_prompt(email)}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
        "max_tokens": 1000
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        raw = json.loads(data["choices"][0]["message"]["content"])
        return parse_ai_response(raw), "NVIDIA NIMs (Llama 3.1 70B)"


def parse_ai_response(raw: dict) -> AITriageResult:
    """Parse and validate raw AI JSON into typed Pydantic model."""
    category_map = {
        "bug report": EmailCategory.BUG_REPORT,
        "billing": EmailCategory.BILLING,
        "how-to": EmailCategory.HOW_TO,
        "feature request": EmailCategory.FEATURE_REQUEST,
        "account access": EmailCategory.ACCOUNT_ACCESS,
        "escalation": EmailCategory.ESCALATION,
        "spam": EmailCategory.SPAM,
        "general inquiry": EmailCategory.GENERAL,
    }
    sentiment_map = {
        "positive": Sentiment.POSITIVE,
        "neutral": Sentiment.NEUTRAL,
        "negative": Sentiment.NEGATIVE,
        "angry": Sentiment.ANGRY,
    }

    cat_raw = raw.get("category", "General Inquiry").lower()
    category = category_map.get(cat_raw, EmailCategory.GENERAL)

    sentiment_raw = raw.get("sentiment", "Neutral").lower()
    sentiment = sentiment_map.get(sentiment_raw, Sentiment.NEUTRAL)

    urgency_val = int(raw.get("urgency", 3))
    urgency_val = max(1, min(5, urgency_val))
    urgency = UrgencyLevel(urgency_val)

    confidence = float(raw.get("confidence", 0.75))
    confidence = max(0.0, min(1.0, confidence))

    requires_review = raw.get("requires_human_review", False)
    if confidence < 0.70:
        requires_review = True

    alt_raw = raw.get("alternative_category")
    alt_category = None
    if alt_raw:
        alt_category = category_map.get(alt_raw.lower())

    return AITriageResult(
        category=category,
        urgency=urgency,
        sentiment=sentiment,
        confidence=confidence,
        reasoning=raw.get("reasoning", "Analysis complete."),
        key_issues=raw.get("key_issues", []),
        suggested_response_time=raw.get("suggested_response_time", "Within 24 hours"),
        alternative_category=alt_category,
        requires_human_review=requires_review,
        human_review_reason=raw.get("human_review_reason"),
        is_spam=raw.get("is_spam", False),
        is_duplicate=raw.get("is_duplicate", False),
        detected_keywords=raw.get("detected_keywords", [])
    )


async def triage_email(email: EmailInput) -> tuple[AITriageResult, str]:
    """
    Main entry point — tries all 4 providers in waterfall order.
    Returns (result, provider_name) or raises if all fail.
    """
    providers = []

    if os.getenv("GROQ_API_KEY"):
        providers.append(("Groq", call_groq))
    if os.getenv("GEMINI_API_KEY"):
        providers.append(("Gemini", call_gemini))
    if os.getenv("OPENROUTER_API_KEY"):
        providers.append(("OpenRouter", call_openrouter))
    if os.getenv("NVIDIA_API_KEY"):
        providers.append(("NVIDIA", call_nvidia))

    if not providers:
        raise ValueError("No AI API keys configured. Please set at least one in .env")

    last_error = None
    for name, fn in providers:
        try:
            result, provider_label = await fn(email)
            return result, provider_label
        except Exception as e:
            last_error = e
            print(f"[TriageIQ] {name} failed: {e}. Trying next provider...")
            continue

    raise RuntimeError(f"All AI providers failed. Last error: {last_error}")
