import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { BatchTriageResponse } from '../../types'
import { categoryColor, urgencyColor, urgencyLabel } from '../../lib/api'

interface Props { results: BatchTriageResponse }

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass px-3 py-2 text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <div className="text-white font-medium">{payload[0].name}</div>
        <div className="text-electric">{payload[0].value} emails</div>
      </div>
    )
  }
  return null
}

export default function AnalyticsPanel({ results }: Props) {
  const nonSpam = results.results.filter(r => !r.ai_result.is_spam)

  // Category breakdown
  const catMap: Record<string, number> = {}
  nonSpam.forEach(r => {
    catMap[r.ai_result.category] = (catMap[r.ai_result.category] || 0) + 1
  })
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }))

  // Urgency breakdown
  const urgMap: Record<number, number> = {}
  nonSpam.forEach(r => {
    urgMap[r.ai_result.urgency] = (urgMap[r.ai_result.urgency] || 0) + 1
  })
  const urgData = Object.entries(urgMap)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([u, count]) => ({
      name: urgencyLabel(Number(u)),
      count,
      urgency: Number(u)
    }))

  // Team workload
  const teamMap: Record<string, number> = {}
  nonSpam.forEach(r => {
    const name = r.assignment.assignee.name
    teamMap[name] = (teamMap[name] || 0) + 1
  })
  const teamData = Object.entries(teamMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name: name.split(' ')[0], count }))

  // Avg confidence
  const avgConf = nonSpam.length
    ? Math.round(nonSpam.reduce((s, r) => s + r.ai_result.confidence, 0) / nonSpam.length * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Avg Confidence */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-5"
      >
        <div className="text-xs text-[#8ba3c4] font-medium mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          AVG AI CONFIDENCE
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-bold text-electric" style={{ fontFamily: 'Syne, sans-serif' }}>
            {avgConf}%
          </span>
          <span className="text-[#8ba3c4] text-sm mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            across {nonSpam.length} emails
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${avgConf}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <div className="mt-2 text-xs text-[#4a6280]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Provider: {results.provider_used}
        </div>
      </motion.div>

      {/* Category Donut */}
      {catData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-5"
        >
          <div className="text-xs text-[#8ba3c4] font-medium mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            CATEGORY BREAKDOWN
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {catData.map((entry, i) => (
                    <Cell key={i} fill={categoryColor(entry.name)} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {catData.map(({ name, value }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: categoryColor(name) }} />
                  <span className="text-[#8ba3c4]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{name}</span>
                </div>
                <span className="text-white font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Urgency bars */}
      {urgData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-5"
        >
          <div className="text-xs text-[#8ba3c4] font-medium mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            URGENCY DISTRIBUTION
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={urgData} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: '#4a6280', fontSize: 10, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {urgData.map((entry, i) => (
                    <Cell key={i} fill={urgencyColor(entry.urgency)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Team workload */}
      {teamData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5"
        >
          <div className="text-xs text-[#8ba3c4] font-medium mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            TEAM ASSIGNMENTS
          </div>
          <div className="space-y-3">
            {teamData.map(({ name, count }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{name}</span>
                  <span className="text-electric" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / nonSpam.length) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
