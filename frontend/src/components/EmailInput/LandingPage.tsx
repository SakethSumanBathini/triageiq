import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus, Trash2, Mail, ChevronDown, AlertCircle, Sparkles } from 'lucide-react'
import type { EmailInput } from '../../types'
import { getSampleEmails } from '../../lib/api'

interface Props {
  onSubmit: (emails: EmailInput[]) => void
  isLoading: boolean
  error: string | null
}

const emptyEmail = (): EmailInput => ({
  subject: '', body: '', sender: '', sender_name: ''
})

export default function LandingPage({ onSubmit, isLoading, error }: Props) {
  const [emails, setEmails] = useState<EmailInput[]>([emptyEmail()])
  const [samples, setSamples] = useState<EmailInput[]>([])
  const [showSamples, setShowSamples] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    getSampleEmails().then(setSamples).catch(() => {})
  }, [])

  const updateEmail = (idx: number, field: keyof EmailInput, value: string) => {
    setEmails(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  const addEmail = () => {
    if (emails.length >= 10) return
    setEmails(prev => [...prev, emptyEmail()])
    setActiveIndex(emails.length)
  }

  const removeEmail = (idx: number) => {
    if (emails.length === 1) return
    setEmails(prev => prev.filter((_, i) => i !== idx))
    setActiveIndex(Math.max(0, idx - 1))
  }

  const loadSample = (sample: EmailInput) => {
    setEmails(prev => prev.map((e, i) => i === activeIndex ? { ...sample } : e))
    setShowSamples(false)
  }

  const loadAllSamples = () => {
    setEmails(samples.slice(0, 10))
    setShowSamples(false)
    setActiveIndex(0)
  }

  const canSubmit = emails.some(e => e.subject.trim() && e.body.trim())

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-8 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-electric">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-700 text-xl tracking-tight text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Triage<span className="text-electric">IQ</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400">AI Ready</span>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center px-6 pt-8 pb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-xs font-medium text-electric border border-electric/20">
          <Sparkles size={12} />
          Powered by Groq · Gemini · OpenRouter · NVIDIA NIMs
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          Stop triaging emails<br />
          <span className="text-electric">manually.</span>
        </h1>
        <p className="text-lg text-[#8ba3c4] max-w-xl mx-auto leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Paste your support emails. AI classifies, scores urgency, and routes to the right team member — instantly.
        </p>
      </motion.div>

      {/* ── Main Input Area ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto w-full px-6 pb-16 flex-1"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        {/* Tab bar for multiple emails */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {emails.map((email, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeIndex === idx
                  ? 'bg-electric/15 border border-electric/40 text-electric'
                  : 'glass border border-transparent text-[#8ba3c4] hover:text-white'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <Mail size={13} />
              {email.subject ? email.subject.slice(0, 20) + (email.subject.length > 20 ? '…' : '') : `Email ${idx + 1}`}
              {emails.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); removeEmail(idx) }}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={11} />
                </span>
              )}
            </button>
          ))}
          {emails.length < 10 && (
            <button onClick={addEmail} className="btn-secondary py-2 px-3 text-xs">
              <Plus size={13} /> Add
            </button>
          )}
        </div>

        {/* Active email form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="glass p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Sender Name
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. John Smith"
                  value={emails[activeIndex]?.sender_name || ''}
                  onChange={e => updateEmail(activeIndex, 'sender_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Sender Email
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. john@company.com"
                  value={emails[activeIndex]?.sender || ''}
                  onChange={e => updateEmail(activeIndex, 'sender', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Subject Line <span className="text-red-400">*</span>
              </label>
              <input
                className="input-field"
                placeholder="e.g. URGENT: Production server is down"
                value={emails[activeIndex]?.subject || ''}
                onChange={e => updateEmail(activeIndex, 'subject', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8ba3c4] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Email Body <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input-field min-h-[180px]"
                placeholder="Paste the full email body here..."
                value={emails[activeIndex]?.body || ''}
                onChange={e => updateEmail(activeIndex, 'body', e.target.value)}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sample emails dropdown */}
        {samples.length > 0 && (
          <div className="relative mt-4">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="btn-secondary w-full justify-between"
            >
              <span>Load Sample Email</span>
              <ChevronDown size={14} className={`transition-transform ${showSamples ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showSamples && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 z-50 mt-2 glass-strong border border-[rgba(0,212,255,0.15)] rounded-xl overflow-hidden shadow-2xl"
                >
                  <div className="p-2">
                    <button
                      onClick={loadAllSamples}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-electric/10 transition-colors border border-electric/20 mb-2"
                    >
                      <div className="text-electric font-medium text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                        ⚡ Load All 10 Sample Emails
                      </div>
                      <div className="text-[#8ba3c4] text-xs mt-0.5">Demo all categories at once</div>
                    </button>
                    {samples.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => loadSample(s)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="text-white text-sm font-medium truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {s.subject}
                        </div>
                        <div className="text-[#8ba3c4] text-xs mt-0.5 truncate">
                          {s.sender_name} · {s.body.slice(0, 60)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Submit */}
        <motion.div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => onSubmit(emails.filter(e => e.subject.trim() && e.body.trim()))}
            disabled={!canSubmit || isLoading}
            className="btn-primary flex-1 py-4 text-base"
          >
            <Zap size={18} />
            {isLoading ? 'Analyzing…' : `Analyze ${emails.filter(e => e.subject.trim()).length} Email${emails.filter(e => e.subject.trim()).length !== 1 ? 's' : ''}`}
          </button>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: 'AI Providers', value: '4x Fallback' },
            { label: 'Edge Cases', value: '12 Handled' },
            { label: 'Avg Analysis', value: '< 3 sec' },
          ].map(({ label, value }) => (
            <div key={label} className="glass p-4">
              <div className="text-electric font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
              <div className="text-[#8ba3c4] text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
