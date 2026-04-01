export type EmailCategory =
  | 'Bug Report'
  | 'Billing'
  | 'How-To'
  | 'Feature Request'
  | 'Account Access'
  | 'Escalation'
  | 'Spam'
  | 'General Inquiry'

export type UrgencyLevel = 1 | 2 | 3 | 4 | 5

export type Sentiment = 'Positive' | 'Neutral' | 'Negative' | 'Angry'

export interface EmailInput {
  subject: string
  body: string
  sender?: string
  sender_name?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  avatar: string
  current_load: number
  max_load: number
}

export interface AITriageResult {
  category: EmailCategory
  urgency: UrgencyLevel
  sentiment: Sentiment
  confidence: number
  reasoning: string
  key_issues: string[]
  suggested_response_time: string
  alternative_category: EmailCategory | null
  requires_human_review: boolean
  human_review_reason: string | null
  is_spam: boolean
  is_duplicate: boolean
  detected_keywords: string[]
}

export interface AssignmentResult {
  assignee: TeamMember
  assignment_reason: string
  workload_after: number
  rule_overrides: string[]
  escalated: boolean
}

export interface TriageResponse {
  id: string
  email: EmailInput
  ai_result: AITriageResult
  assignment: AssignmentResult
  provider_used: string
  processing_time_ms: number
  timestamp: string
}

export interface BatchTriageResponse {
  results: TriageResponse[]
  total_processed: number
  high_urgency_count: number
  human_review_count: number
  provider_used: string
  total_processing_time_ms: number
}

export interface AnalyticsData {
  total_emails: number
  category_breakdown: Record<string, number>
  urgency_breakdown: Record<string, number>
  avg_confidence: number
  human_review_rate: number
  provider_stats: Record<string, number>
}

export type AppView = 'input' | 'processing' | 'dashboard'
