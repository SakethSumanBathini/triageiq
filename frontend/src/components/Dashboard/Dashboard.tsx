import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, RotateCcw, AlertTriangle, CheckCircle,
  Clock, Users, Filter, ChevronDown
} from 'lucide-react'
import type { BatchTriageResponse, TriageResponse } from '../../types'
import {
  urgencyColor, urgencyLabel, categoryColor,
  sentimentEmoji, confidenceLabel, formatTime
} from '../../lib/api'
import EmailDetailDrawer from '../EmailDetail/EmailDetailDrawer'
import AnalyticsPanel from './AnalyticsPanel'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts'

interface Props {
  results: BatchTriageResponse
  onReset: () => void
}

export default function Dashboard({ results, onReset }: Props) {
  const [selected, setSelected] = useState<TriageResponse | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [filterUrgency, setFilterUrgency] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'urgency' | 'confidence' | 'category'>('urgency')

  const nonSpam = results.results.filter(r => !r.ai_result.is_spam)
  const spam = results.results.filter(r => r.ai_result.is_spam)

  const categories = ['All', ...Array.from(new Set(nonSpam.map(r => r.ai_result.category)))]
  const urgencies = ['All', '5 - Critical', '4 - High', '3 - Medium', '2 - Low', '1 - Very Low']

  const filtered = nonSpam
    .filter(r => filterCategory === 'All' || r.ai_result.category === filterCategory)
    .filter(r => filterUrgency === 'All' || r.ai_result.urgency === parseInt(filterUrgency))
    .sort((a, b) => {
      if (sortBy === 'urgency') return b.ai_result.urgency - a.ai_result.urgency
      if (sortBy === 'confidence') return b.ai_result.confidence - a.ai_result.confidence
      return a.ai_result.category.localeCompare(b.ai_result.category)
    })

  const humanReviewItems = filtered.filter(r => r.ai_result.requires_human_review)

  // KPI values
  const kpis = [
    {
      label: 'Emails Processed',
      value: results.total_processed,
      sub: `${spam.length} spam filtered`,
      icon: CheckCircle,
      color: '#22c55e'
    },
    {
      label: 'High Priority',
      value: results.high_urgency_count,
      sub: 'Urgency 4 or 5',
      icon: AlertTriangle,
      color: '#ef4444'
    },
    {
      label: 'Needs Review',
      value: results.human_review_count,
      sub: 'Low confidence flags',
      icon: Users,
      color: '#f59e0b'
    },
    {
      label: 'Processing Time',
      value: formatTime(results.total_processing_time_ms),
      sub: results.provider_used,
      icon: Clock,
      color: '#00d4ff'
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,212,255,0.08)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Triage<span className="text-electric">IQ</span>
          </span>
          <span className="hidden sm:block px-3 py-1 rounded-full bg-electric/10 text-electric text-xs border border-electric/20" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Dashboard
          </span>
        </div>
        <button onClick={onReset} className="btn-secondary py-2">
          <RotateCcw size={14} />
          New Analysis
        </button>
      </motion.header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}18` }}>
                    <Icon size={18} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {kpi.value}
                </div>
                <div className="text-sm font-medium text-white/80" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {kpi.label}
                </div>
                <div className="text-xs text-[#8ba3c4] mt-1 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {kpi.sub}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Human Review Alert */}
        {humanReviewItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-amber-400 font-medium text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {humanReviewItems.length} email{humanReviewItems.length !== 1 ? 's' : ''} flagged for human review
              </span>
              <span className="text-[#8ba3c4] text-sm ml-2">
                — AI confidence below threshold. Manual verification recommended.
              </span>
            </div>
          </motion.div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Email Queue — takes 2/3 */}
          <div className="xl:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[#8ba3c4] text-sm">
                <Filter size={14} />
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Filter:</span>
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="input-field py-2 px-3 w-auto text-sm cursor-pointer"
                style={{ resize: 'none' }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filterUrgency}
                onChange={e => setFilterUrgency(e.target.value)}
                className="input-field py-2 px-3 w-auto text-sm cursor-pointer"
              >
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="input-field py-2 px-3 w-auto text-sm cursor-pointer"
              >
                <option value="urgency">Sort: Urgency</option>
                <option value="confidence">Sort: Confidence</option>
                <option value="category">Sort: Category</option>
              </select>
              <span className="text-[#4a6280] text-xs ml-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {filtered.length} results
              </span>
            </div>

            {/* Queue */}
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(item)}
                  className="glass p-5 cursor-pointer hover:border-[rgba(0,212,255,0.25)] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Urgency indicator */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1 mt-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: urgencyColor(item.ai_result.urgency), boxShadow: `0 0 8px ${urgencyColor(item.ai_result.urgency)}` }}
                      />
                      <span className="text-xs font-bold" style={{ color: urgencyColor(item.ai_result.urgency), fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.ai_result.urgency}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-electric transition-colors truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {item.email.subject}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.ai_result.requires_human_review && (
                            <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              ⚠ Review
                            </span>
                          )}
                          {item.assignment.escalated && (
                            <span className="badge bg-red-500/15 text-red-400 border border-red-500/20">
                              🚨 Escalated
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Category badge */}
                        <span
                          className="badge"
                          style={{
                            background: `${categoryColor(item.ai_result.category)}18`,
                            color: categoryColor(item.ai_result.category),
                            border: `1px solid ${categoryColor(item.ai_result.category)}30`
                          }}
                        >
                          {item.ai_result.category}
                        </span>

                        {/* Sentiment */}
                        <span className="badge bg-white/5 text-[#8ba3c4] border border-white/10">
                          {sentimentEmoji(item.ai_result.sentiment)} {item.ai_result.sentiment}
                        </span>

                        {/* Response time */}
                        <span className="badge bg-white/5 text-[#8ba3c4] border border-white/10">
                          <Clock size={10} /> {item.ai_result.suggested_response_time}
                        </span>
                      </div>

                      {/* Urgency bar */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.ai_result.urgency / 5) * 100}%` }}
                            transition={{ delay: i * 0.05 + 0.3, duration: 0.8 }}
                            style={{ background: urgencyColor(item.ai_result.urgency) }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: urgencyColor(item.ai_result.urgency), fontFamily: 'JetBrains Mono, monospace' }}>
                          {urgencyLabel(item.ai_result.urgency)}
                        </span>
                      </div>

                      {/* Assignee + Confidence */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-electric/15 border border-electric/20 flex items-center justify-center text-electric text-xs font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {item.assignment.assignee.avatar}
                          </div>
                          <div>
                            <div className="text-white text-xs font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                              {item.assignment.assignee.name}
                            </div>
                            <div className="text-[#8ba3c4] text-xs">{item.assignment.assignee.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace', color: item.ai_result.confidence >= 0.75 ? '#22c55e' : '#f59e0b' }}>
                            {Math.round(item.ai_result.confidence * 100)}%
                          </div>
                          <div className="text-[#4a6280] text-xs">{confidenceLabel(item.ai_result.confidence)}</div>
                        </div>
                      </div>
                    </div>

                    <ChevronDown size={14} className="text-[#4a6280] group-hover:text-electric transition-colors flex-shrink-0 rotate-[-90deg] mt-1" />
                  </div>
                </motion.div>
              ))}

              {filtered.length === 0 && (
                <div className="glass p-12 text-center text-[#4a6280]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  No emails match current filters.
                </div>
              )}
            </div>

            {/* Spam section */}
            {spam.length > 0 && (
              <div className="glass p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-[#8ba3c4] text-sm font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {spam.length} email{spam.length !== 1 ? 's' : ''} filtered as spam
                  </span>
                </div>
                {spam.map(s => (
                  <div key={s.id} className="text-xs text-[#4a6280] py-1 border-t border-white/5 first:border-0 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    🚫 {s.email.subject}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics sidebar — takes 1/3 */}
          <AnalyticsPanel results={results} />
        </div>
      </div>

      {/* Email detail drawer */}
      {selected && (
        <EmailDetailDrawer
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
