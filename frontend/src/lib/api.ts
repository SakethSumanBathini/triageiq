import axios from 'axios'
import type {
  EmailInput, TriageResponse, BatchTriageResponse,
  TeamMember, AnalyticsData
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

export const triageEmail = async (email: EmailInput): Promise<TriageResponse> => {
  const { data } = await api.post('/api/triage', email)
  return data
}

export const triageBatch = async (emails: EmailInput[]): Promise<BatchTriageResponse> => {
  const { data } = await api.post('/api/triage/batch', { emails })
  return data
}

export const getTeam = async (): Promise<TeamMember[]> => {
  const { data } = await api.get('/api/team')
  return data.members
}

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const { data } = await api.get('/api/analytics')
  return data
}

export const getSampleEmails = async (): Promise<EmailInput[]> => {
  const { data } = await api.get('/api/samples')
  return data
}

export const healthCheck = async () => {
  const { data } = await api.get('/api/health')
  return data
}

// ── Color helpers ──────────────────────────────────────────────────────────

export const urgencyColor = (u: number): string => {
  const map: Record<number, string> = {
    1: '#22c55e',
    2: '#84cc16',
    3: '#eab308',
    4: '#f97316',
    5: '#ef4444',
  }
  return map[u] ?? '#6b7280'
}

export const urgencyLabel = (u: number): string => {
  const map: Record<number, string> = {
    1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Critical'
  }
  return map[u] ?? 'Unknown'
}

export const categoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    'Bug Report': '#ef4444',
    'Billing': '#f59e0b',
    'How-To': '#3b82f6',
    'Feature Request': '#8b5cf6',
    'Account Access': '#06b6d4',
    'Escalation': '#f97316',
    'Spam': '#6b7280',
    'General Inquiry': '#10b981',
  }
  return map[cat] ?? '#6b7280'
}

export const sentimentEmoji = (s: string): string => {
  const map: Record<string, string> = {
    'Positive': '😊', 'Neutral': '😐', 'Negative': '😟', 'Angry': '😠'
  }
  return map[s] ?? '😐'
}

export const confidenceLabel = (c: number): string => {
  if (c >= 0.9) return 'Very High'
  if (c >= 0.75) return 'High'
  if (c >= 0.6) return 'Medium'
  return 'Low'
}

export const formatTime = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export const clsx = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ')
