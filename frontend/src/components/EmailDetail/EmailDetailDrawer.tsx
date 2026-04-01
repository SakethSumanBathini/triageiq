import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain, Shield, Users, AlertTriangle, Clock, Mail, CheckCircle } from 'lucide-react'
import type { TriageResponse } from '../../types'
import { urgencyColor, urgencyLabel, categoryColor, sentimentEmoji, confidenceLabel } from '../../lib/api'

interface Props {
  item: TriageResponse
  onClose: () => void
}

export default function EmailDetailDrawer({ item, onClose }: Props) {
  const { email, ai_result, assignment } = item

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-lg h-full glass-strong border-l border-[rgba(0,212,255,0.15)] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 glass-strong border-b border-[rgba(0,212,255,0.1)] px-6 py-4 flex items-start justify-between gap-4 z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-[#4a6280]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  #{item.id}
                </span>
                {ai_result.requires_human_review && (
                  <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    ⚠ Human Review Required
                  </span>
                )}
              </div>
              <h2 className="font-bold text-white text-base leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {email.subject}
              </h2>
              <div className="text-[#8ba3c4] text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {email.sender_name && `${email.sender_name} · `}{email.sender}
              </div>
            </div>
            <button onClick={onClose} className="text-[#8ba3c4] hover:text-white transition-colors flex-shrink-0 p-1">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* AI Decision Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-4">
                <div className="text-xs text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>CATEGORY</div>
                <div className="font-bold text-sm" style={{ color: categoryColor(ai_result.category), fontFamily: 'Syne, sans-serif' }}>
                  {ai_result.category}
                </div>
                {ai_result.alternative_category && (
                  <div className="text-xs text-[#4a6280] mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Alt: {ai_result.alternative_category}
                  </div>
                )}
              </div>
              <div className="glass p-4">
                <div className="text-xs text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>URGENCY</div>
                <div className="font-bold text-2xl" style={{ color: urgencyColor(ai_result.urgency), fontFamily: 'Syne, sans-serif' }}>
                  {ai_result.urgency}<span className="text-base">/5</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: urgencyColor(ai_result.urgency), fontFamily: 'DM Sans, sans-serif' }}>
                  {urgencyLabel(ai_result.urgency)}
                </div>
              </div>
              <div className="glass p-4">
                <div className="text-xs text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>SENTIMENT</div>
                <div className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {sentimentEmoji(ai_result.sentiment)} {ai_result.sentiment}
                </div>
              </div>
              <div className="glass p-4">
                <div className="text-xs text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>CONFIDENCE</div>
                <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: ai_result.confidence >= 0.75 ? '#22c55e' : '#f59e0b' }}>
                  {Math.round(ai_result.confidence * 100)}%
                </div>
                <div className="text-xs mt-0.5 text-[#4a6280]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {confidenceLabel(ai_result.confidence)}
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-electric/5 border border-electric/15">
              <Clock size={16} className="text-electric flex-shrink-0" />
              <div>
                <div className="text-xs text-[#8ba3c4]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Suggested Response Time</div>
                <div className="text-white font-medium text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {ai_result.suggested_response_time}
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="glass p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} className="text-electric" />
                <span className="text-xs font-medium text-electric" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  AI REASONING
                </span>
              </div>
              <p className="text-[#c0d0e8] text-sm leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {ai_result.reasoning}
              </p>
            </div>

            {/* Key Issues */}
            {ai_result.key_issues.length > 0 && (
              <div className="glass p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    KEY ISSUES DETECTED
                  </span>
                </div>
                <ul className="space-y-2">
                  {ai_result.key_issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#c0d0e8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assignment */}
            <div className="glass p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-green-400" />
                <span className="text-xs font-medium text-green-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  ASSIGNMENT DECISION
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-electric/15 border border-electric/20 flex items-center justify-center text-electric font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {assignment.assignee.avatar}
                </div>
                <div>
                  <div className="text-white font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {assignment.assignee.name}
                  </div>
                  <div className="text-[#8ba3c4] text-xs">{assignment.assignee.role}</div>
                  <div className="text-[#4a6280] text-xs">
                    Load: {assignment.assignee.current_load}/{assignment.assignee.max_load} → {assignment.workload_after}/{assignment.assignee.max_load}
                  </div>
                </div>
              </div>
              <p className="text-[#8ba3c4] text-xs leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {assignment.assignment_reason}
              </p>
              {assignment.rule_overrides.length > 0 && (
                <div className="mt-3 space-y-1">
                  {assignment.rule_overrides.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <Shield size={10} className="mt-0.5 flex-shrink-0" />
                      {rule}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Human review warning */}
            {ai_result.requires_human_review && ai_result.human_review_reason && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-400 font-medium text-sm mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Human Review Required
                  </div>
                  <p className="text-amber-400/70 text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {ai_result.human_review_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Keywords */}
            {ai_result.detected_keywords.length > 0 && (
              <div>
                <div className="text-xs text-[#4a6280] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>DETECTED KEYWORDS</div>
                <div className="flex flex-wrap gap-2">
                  {ai_result.detected_keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[#8ba3c4] text-xs border border-white/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Original email */}
            <div className="glass p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={14} className="text-[#8ba3c4]" />
                <span className="text-xs font-medium text-[#8ba3c4]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  ORIGINAL EMAIL
                </span>
              </div>
              <pre className="text-[#8ba3c4] text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {email.body}
              </pre>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-[#4a6280]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span>Processed in {item.processing_time_ms}ms</span>
              <span>{item.provider_used}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
