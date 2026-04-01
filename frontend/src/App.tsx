import { useState, useCallback } from 'react'
import type { AppView, EmailInput, BatchTriageResponse } from './types'
import LandingPage from './components/EmailInput/LandingPage'
import ProcessingView from './components/Processing/ProcessingView'
import Dashboard from './components/Dashboard/Dashboard'
import { triageBatch } from './lib/api'

export default function App() {
  const [view, setView] = useState<AppView>('input')
  const [results, setResults] = useState<BatchTriageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingEmails, setProcessingEmails] = useState<EmailInput[]>([])

  const handleSubmit = useCallback(async (emails: EmailInput[]) => {
    setError(null)
    setProcessingEmails(emails)
    setView('processing')
    setIsLoading(true)
    try {
      const data = await triageBatch(emails)
      setResults(data)
      setView('dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process emails'
      setError(msg)
      setView('input')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleReset = useCallback(() => {
    setView('input')
    setResults(null)
    setError(null)
    setProcessingEmails([])
  }, [])

  return (
    <div className="mesh-bg min-h-screen">
      {view === 'input' && (
        <LandingPage
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
      {view === 'processing' && (
        <ProcessingView emails={processingEmails} />
      )}
      {view === 'dashboard' && results && (
        <Dashboard results={results} onReset={handleReset} />
      )}
    </div>
  )
}
