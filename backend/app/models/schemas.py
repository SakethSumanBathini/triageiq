from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class EmailCategory(str, Enum):
    BUG_REPORT = "Bug Report"
    BILLING = "Billing"
    HOW_TO = "How-To"
    FEATURE_REQUEST = "Feature Request"
    ACCOUNT_ACCESS = "Account Access"
    ESCALATION = "Escalation"
    SPAM = "Spam"
    GENERAL = "General Inquiry"


class UrgencyLevel(int, Enum):
    VERY_LOW = 1
    LOW = 2
    MEDIUM = 3
    HIGH = 4
    CRITICAL = 5


class Sentiment(str, Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"
    ANGRY = "Angry"


class TeamMember(BaseModel):
    id: str
    name: str
    role: str
    skills: List[str]
    avatar: str
    current_load: int = 0
    max_load: int


class EmailInput(BaseModel):
    subject: str = Field(..., min_length=1, description="Email subject line")
    body: str = Field(..., min_length=1, description="Email body content")
    sender: Optional[str] = Field(default="customer@unknown.com")
    sender_name: Optional[str] = Field(default="Unknown Customer")


class BatchEmailInput(BaseModel):
    emails: List[EmailInput] = Field(..., min_length=1, max_length=20)


class AITriageResult(BaseModel):
    category: EmailCategory
    urgency: UrgencyLevel
    sentiment: Sentiment
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    key_issues: List[str]
    suggested_response_time: str
    alternative_category: Optional[EmailCategory] = None
    requires_human_review: bool = False
    human_review_reason: Optional[str] = None
    is_spam: bool = False
    is_duplicate: bool = False
    detected_keywords: List[str] = []


class AssignmentResult(BaseModel):
    assignee: TeamMember
    assignment_reason: str
    workload_after: int
    rule_overrides: List[str] = []
    escalated: bool = False


class TriageResponse(BaseModel):
    id: str
    email: EmailInput
    ai_result: AITriageResult
    assignment: AssignmentResult
    provider_used: str
    processing_time_ms: float
    timestamp: str


class BatchTriageResponse(BaseModel):
    results: List[TriageResponse]
    total_processed: int
    high_urgency_count: int
    human_review_count: int
    provider_used: str
    total_processing_time_ms: float


class TeamRosterResponse(BaseModel):
    members: List[TeamMember]


class AnalyticsResponse(BaseModel):
    total_emails: int
    category_breakdown: dict
    urgency_breakdown: dict
    avg_confidence: float
    human_review_rate: float
    provider_stats: dict
