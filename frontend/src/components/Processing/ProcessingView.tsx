import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Shield, Users, CheckCircle, Zap } from 'lucide-react'
import type { EmailInput } from '../../types'

interface Props { emails: EmailInput[] }

const steps = [
  { icon: Brain, label: 'Parsing email content', detail: 'Extracting subject, body, and metadata' },
  { icon: Brain, label: 'AI classification', detail: 'Identifying issue type with Llama 3.3 70B' },
  { icon: Shield, label: 'Urgency scoring', detail: 'Estimating business impact (1–5 scale)' },
  { icon: Shield, label: 'Business rules engine', detail: 'Applying 12 edge case checks' },
  { icon: Users, label: 'Team assignment', detail: 'Matching skills and balancing workload' },
  { icon: CheckCircle, label: 'Finalizing results', detail: 'Preparing your dashboard' },
]

const thoughts = [
  '"Is this a billing issue or a bug report?"',
  '"Checking for critical production keywords…"',
  '"Sentiment: Negative — customer is frustrated"',
  '"Confidence: 94% — high certainty classification"',
  '"Priya Sharma has capacity and skill match"',
  '"Urgency override: production down detected"',
  '"Human review flag: confidence below threshold"',
  '"Routing to senior engineer — severity 5"',
]

export default function ProcessingView({ emails }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          setCompletedSteps(c => [...c, prev])
          return prev + 1
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 900)
    return () => clearInterval(stepInterval)
  }, [])

  useEffect(() => {
    const thoughtInterval = setInterval(() => {
      setThoughtIdx(prev => (prev + 1) % thoughts.length)
    }, 1400)
    return () => clearInterval(thoughtInterval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 mb-12"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-electric-strong animate-pulse">
          <Zap size={22} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Triage<span className="text-electric">IQ</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Analyzing {emails.length} email{emails.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-[#8ba3c4]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Multi-step AI triage in progress…
          </p>
        </div>

        {/* AI thought bubble */}
        <div className="glass p-4 mb-8 min-h-[56px] flex items-center gap-3">
          <div className="flex gap-1 flex-shrink-0">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-electric"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={thoughtIdx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm text-electric font-mono"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {thoughts[thoughtIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Steps */}
        <div className="glass p-6 space-y-1">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isDone = completedSteps.includes(idx)
            const isActive = currentStep === idx
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-electric/10 border border-electric/20' :
                  isDone ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'bg-green-500/20' :
                  isActive ? 'bg-electric/20' : 'bg-white/5'
                }`}>
                  {isDone
                    ? <CheckCircle size={16} className="text-green-400" />
                    : <Icon size={16} className={isActive ? 'text-electric' : 'text-[#4a6280]'} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isDone ? 'text-green-400' : isActive ? 'text-white' : 'text-[#4a6280]'}`}
                    style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {step.label}
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[#8ba3c4] mt-0.5"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {step.detail}
                    </motion.div>
                  )}
                </div>
                {isActive && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1 h-1 rounded-full bg-electric"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-center mt-2 text-xs text-[#8ba3c4]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          Step {currentStep + 1} of {steps.length}
        </div>
      </motion.div>
    </div>
  )
}
