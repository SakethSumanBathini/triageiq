import json
import os
from typing import List, Optional
from app.models.schemas import (
    AITriageResult, AssignmentResult, TeamMember,
    EmailCategory, UrgencyLevel, EmailInput
)

# Critical keywords that force urgency 5 regardless of AI score
CRITICAL_KEYWORDS = [
    "production down", "server down", "completely down", "all users",
    "revenue loss", "data loss", "security breach", "hacked",
    "outage", "offline", "not working for everyone", "500 error",
    "database down", "service unavailable", "system failure"
]

# Keywords that indicate spam
SPAM_INDICATORS = [
    "click here to claim", "limited time offer", "you've been selected",
    "congratulations!", "50% off", "100% off", "make money fast",
    "totally-legit", "no credit card needed for prizes"
]

# Senior-only categories (junior engineers cannot handle these)
SENIOR_ONLY_CATEGORIES = [
    EmailCategory.ESCALATION,
]
SENIOR_ONLY_URGENCY = UrgencyLevel.CRITICAL  # urgency 5


def load_team() -> List[TeamMember]:
    """Load team roster from JSON file."""
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "team_roster.json")
    with open(data_path) as f:
        members_data = json.load(f)
    return [TeamMember(**m) for m in members_data]


def apply_rules(
    email: EmailInput,
    ai_result: AITriageResult
) -> AITriageResult:
    """
    Apply business rules on top of AI classification.
    Rules can OVERRIDE AI decisions.
    """
    email_text = f"{email.subject} {email.body}".lower()
    overrides = []

    # Rule 1: Critical keyword detection → force urgency 5
    for keyword in CRITICAL_KEYWORDS:
        if keyword in email_text:
            if ai_result.urgency < UrgencyLevel.CRITICAL:
                ai_result.urgency = UrgencyLevel.CRITICAL
                overrides.append(f"Urgency overridden to 5: critical keyword '{keyword}' detected")
            break

    # Rule 2: Spam detection override
    spam_hits = sum(1 for indicator in SPAM_INDICATORS if indicator.lower() in email_text)
    if spam_hits >= 2:
        ai_result.category = EmailCategory.SPAM
        ai_result.is_spam = True
        ai_result.urgency = UrgencyLevel.VERY_LOW
        ai_result.confidence = 0.95
        overrides.append("Classified as SPAM: multiple spam indicators detected")

    # Rule 3: Very short email with no context → flag for human review
    body_word_count = len(email.body.split())
    if body_word_count < 8 and not ai_result.requires_human_review:
        ai_result.requires_human_review = True
        ai_result.human_review_reason = "Email too short to classify with confidence"
        overrides.append("Human review required: email lacks sufficient context")

    # Rule 4: Dual-category email (billing + bug) → add note to reasoning
    has_billing_keywords = any(k in email_text for k in ["invoice", "charge", "billing", "payment", "refund", "charged"])
    has_bug_keywords = any(k in email_text for k in ["error", "bug", "crash", "broken", "not working", "exception"])
    if has_billing_keywords and has_bug_keywords and ai_result.category not in [EmailCategory.SPAM]:
        if ai_result.category not in [EmailCategory.BILLING, EmailCategory.BUG_REPORT]:
            pass
        else:
            secondary = "Billing" if ai_result.category == EmailCategory.BUG_REPORT else "Bug Report"
            ai_result.reasoning += f" [Note: Email also contains {secondary} indicators - primary category assigned.]"

    return ai_result


def assign_team_member(
    ai_result: AITriageResult,
    team: List[TeamMember]
) -> AssignmentResult:
    """
    Assign the best available team member based on:
    1. Skill match with email category
    2. Not overloaded
    3. Seniority rules (junior cannot get critical tickets)
    4. Workload balance
    """
    rule_overrides = []
    escalated = False

    # If spam, don't assign anyone
    if ai_result.is_spam:
        spam_member = TeamMember(
            id="system",
            name="Spam Filter",
            role="Automated System",
            skills=["Spam"],
            avatar="SF",
            current_load=0,
            max_load=999
        )
        return AssignmentResult(
            assignee=spam_member,
            assignment_reason="Email identified as spam — automatically filtered, no human action required.",
            workload_after=0,
            rule_overrides=["SPAM: Auto-filtered by system"],
            escalated=False
        )

    category_name = ai_result.category.value
    is_critical = ai_result.urgency >= UrgencyLevel.CRITICAL
    is_senior_only = ai_result.category in SENIOR_ONLY_CATEGORIES or is_critical

    # Filter eligible members
    eligible = []
    for member in team:
        # Skill match
        if category_name not in member.skills:
            continue

        # Not overloaded
        if member.current_load >= member.max_load:
            continue

        # Junior cannot handle critical or escalation
        if is_senior_only and member.role == "Junior Support":
            rule_overrides.append(f"Blocked: {member.name} (Junior) cannot handle {category_name} at urgency {ai_result.urgency}")
            continue

        eligible.append(member)

    # Sort by: urgency preference (senior first for high urgency), then by current load
    if is_critical:
        eligible.sort(key=lambda m: (
            0 if "Senior" in m.role or "Lead" in m.role else 1,
            m.current_load
        ))
    else:
        eligible.sort(key=lambda m: m.current_load)

    if not eligible:
        # Fallback: find anyone with capacity
        fallback_candidates = [m for m in team if m.current_load < m.max_load]
        if fallback_candidates:
            fallback_candidates.sort(key=lambda m: m.current_load)
            assignee = fallback_candidates[0]
            rule_overrides.append("Warning: No perfect skill match — assigned to least-loaded available member")
            escalated = is_critical
        else:
            # All overloaded, assign to most relevant regardless
            relevant = [m for m in team if category_name in m.skills]
            if not relevant:
                relevant = team
            relevant.sort(key=lambda m: m.current_load)
            assignee = relevant[0]
            rule_overrides.append("Warning: All team members at capacity — assigned to best available")
            escalated = True
    else:
        assignee = eligible[0]

    reason = (
        f"Assigned to {assignee.name} ({assignee.role}) — "
        f"skill match for {category_name}, "
        f"current load: {assignee.current_load}/{assignee.max_load}"
    )

    if escalated:
        reason += " [ESCALATED: critical urgency requires immediate attention]"

    return AssignmentResult(
        assignee=assignee,
        assignment_reason=reason,
        workload_after=assignee.current_load + 1,
        rule_overrides=rule_overrides,
        escalated=escalated
    )
