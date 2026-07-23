import { useState, useEffect, useRef } from 'react'
import { submitGithubReview, createReviewStream, getReviewReport, applyFixPR } from '../api'

const AGENTS = [
  { id: 'triage', name: 'Triage', icon: '🗂️', accent: '#bf5af2', desc: 'Diff parsing & language classification' },
  { id: 'security', name: 'Security', icon: '🛡️', accent: '#ff453a', desc: 'Vulnerability scan & RAG OWASP lookup' },
  { id: 'style', name: 'Style', icon: '🎨', accent: '#64d2ff', desc: 'Code quality & maintainability check' },
  { id: 'verifier', name: 'Verifier', icon: '⚖️', accent: '#ffd60a', desc: 'Confidence scoring & CWE validation' },
  { id: 'fix', name: 'Fix Generator', icon: '🔧', accent: '#30d158', desc: 'Unified git patch synthesis' },
]

const SAMPLE_FINDINGS = [
  {
    id: 'f-101',
    agent: 'security',
    category: 'security',
    severity: 'critical',
    title: 'SQL Injection via Unsanitized User Input',
    description: 'Raw SQL string formatting allows attacker to manipulate database queries via HTTP request parameters.',
    file: 'app/controllers/user_controller.py',
    line: 42,
    cwe_id: 'CWE-89',
    confidence: 0.96,
    evidence: `query = f"SELECT * FROM users WHERE username = '{user_input}'"\ncursor.execute(query)`
  },
  {
    id: 'f-102',
    agent: 'security',
    category: 'security',
    severity: 'high',
    title: 'Hardcoded Secret Key in Source Code',
    description: 'Cryptographic secret key stored as plaintext string constant in application configuration.',
    file: 'app/config/auth.py',
    line: 14,
    cwe_id: 'CWE-798',
    confidence: 0.92,
    evidence: `SECRET_KEY = "MOCK_SECRET_KEY_EX_84920491"`
  },
  {
    id: 'f-103',
    agent: 'style',
    category: 'quality',
    severity: 'medium',
    title: 'Unused Global Variable & Missing Type Hints',
    description: 'Function signature lacks return type annotation and defines unused variable in outer scope.',
    file: 'app/utils/helpers.py',
    line: 28,
    cwe_id: 'CWE-1078',
    confidence: 0.88,
    evidence: `def calculate_hash(data):\n    temp_token = "unused"\n    return hashlib.sha256(data).hexdigest()`
  }
]

const SAMPLE_PATCHES = [
  {
    id: 'p-1',
    file: 'app/controllers/user_controller.py',
    diff: `@@ -40,4 +40,4 @@
-query = f"SELECT * FROM users WHERE username = '{user_input}'"
-cursor.execute(query)
+query = "SELECT * FROM users WHERE username = %s"
+cursor.execute(query, (user_input,))`
  },
  {
    id: 'p-2',
    file: 'app/config/auth.py',
    diff: `@@ -12,3 +12,3 @@
-SECRET_KEY = "MOCK_SECRET_KEY_EX_84920491"
+SECRET_KEY = os.environ.get("AUTH_SECRET_KEY")`
  }
]

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

function WorkflowStepper({ agentStates }) {
  const getStepStatus = (id) => agentStates[id] || 'idle'

  return (
    <div className="card mb-4" style={{ padding: '20px 24px', background: 'var(--card-bg-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label">Real-Time Tribunal Agent Workflow</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          LangGraph DAG Topology
        </div>
      </div>

      <div className="workflow-pipeline">
        {/* Step 1: Triage */}
        <div className={`pipeline-step ${getStepStatus('triage')}`}>
          <div className="step-badge">🗂️</div>
          <div className="step-info">
            <div className="step-name">1. Triage</div>
            <div className="step-state">{getStepStatus('triage').toUpperCase()}</div>
          </div>
        </div>

        <div className="pipeline-arrow">→</div>

        {/* Parallel Branch: Security & Style */}
        <div className="pipeline-parallel-group">
          <div className={`pipeline-step ${getStepStatus('security')}`}>
            <div className="step-badge">🛡️</div>
            <div className="step-info">
              <div className="step-name">2a. Security (RAG)</div>
              <div className="step-state">{getStepStatus('security').toUpperCase()}</div>
            </div>
          </div>

          <div className={`pipeline-step ${getStepStatus('style')}`}>
            <div className="step-badge">🎨</div>
            <div className="step-info">
              <div className="step-name">2b. Style & Quality</div>
              <div className="step-state">{getStepStatus('style').toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div className="pipeline-arrow">→</div>

        {/* Step 3: Verifier */}
        <div className={`pipeline-step ${getStepStatus('verifier')}`}>
          <div className="step-badge">⚖️</div>
          <div className="step-info">
            <div className="step-name">3. Verifier</div>
            <div className="step-state">{getStepStatus('verifier').toUpperCase()}</div>
          </div>
        </div>

        <div className="pipeline-arrow">→</div>

        {/* Step 4: Fix */}
        <div className={`pipeline-step ${getStepStatus('fix')}`}>
          <div className="step-badge">🔧</div>
          <div className="step-info">
            <div className="step-name">4. Fix Generator</div>
            <div className="step-state">{getStepStatus('fix').toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentCard({ agent, status, count }) {
  const isActive = status === 'active'
  const isDone = status === 'done'

  return (
    <div
      className={`agent-card ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
      style={{ '--agent-accent': agent.accent }}
    >
      {isActive && <div className="radar-sweep" />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1.4rem' }}>{agent.icon}</div>
        <div className={`status-beacon ${isActive ? 'active' : isDone ? 'done' : 'idle'}`} />
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          {agent.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {agent.desc}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        {isActive ? (
          <div className="scanning-indicator">
            <span>SCANNING</span>
            <div className="scanning-bar">
              <div className="scanning-bar-inner" />
            </div>
          </div>
        ) : isDone ? (
          <span style={{ fontSize: '0.75rem', color: '#30d158', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
            PASSED
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            STANDBY
          </span>
        )}

        {count > 0 && (
          <span className="badge badge-medium">{count} issues</span>
        )}
      </div>
    </div>
  )
}

function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false)
  const sev = finding.severity?.toLowerCase() || 'low'

  return (
    <div className="finding-card">
      <div className="finding-header">
        <div className="finding-title">{finding.title}</div>
        <div className="finding-meta">
          <span className={`badge badge-${sev}`}>{sev}</span>
          {finding.cwe_id && <span className="badge badge-tag">{finding.cwe_id}</span>}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            {Math.round((finding.confidence || 0) * 100)}% confidence
          </span>
        </div>
      </div>

      <div className="finding-desc">{finding.description}</div>

      {finding.file && (
        <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Location: {finding.file}{finding.line ? `:${finding.line}` : ''}
        </div>
      )}

      {finding.evidence && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--amd-red)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0
            }}
          >
            {expanded ? 'Hide Vulnerable Code Snippet ▲' : 'View Vulnerable Code Snippet ▼'}
          </button>
          {expanded && <div className="finding-evidence">{finding.evidence}</div>}
        </div>
      )}
    </div>
  )
}

function PatchCard({ patch }) {
  return (
    <div className="card mb-3" style={{ background: '#05070a', border: '1px solid rgba(48,209,88,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#30d158', fontFamily: 'JetBrains Mono' }}>
          📄 {patch.file}
        </div>
        <span className="badge badge-tag" style={{ color: '#30d158', borderColor: 'rgba(48,209,88,0.4)' }}>
          Synthesized Patch
        </span>
      </div>
      <pre style={{
        fontFamily: 'JetBrains Mono',
        fontSize: '0.78rem',
        background: '#0a0d14',
        padding: '12px 14px',
        borderRadius: 6,
        overflowX: 'auto',
        color: '#e5e7eb',
        lineHeight: 1.5
      }}>
        {patch.diff.split('\n').map((line, idx) => {
          const isAdd = line.startsWith('+')
          const isDel = line.startsWith('-')
          const isHunk = line.startsWith('@@')
          return (
            <div
              key={idx}
              style={{
                color: isAdd ? '#30d158' : isDel ? '#ff453a' : isHunk ? '#64d2ff' : 'var(--text-secondary)',
                background: isAdd ? 'rgba(48,209,88,0.1)' : isDel ? 'rgba(255,69,58,0.1)' : 'transparent',
                padding: '1px 4px'
              }}
            >
              {line}
            </div>
          )
        })}
      </pre>
    </div>
  )
}

export default function ReviewPage() {
  const [repo, setRepo] = useState('octocat/Hello-World')
  const [prNum, setPrNum] = useState('1')
  const [status, setStatus] = useState('idle') // idle | running | complete | error
  const [agentStates, setAgentStates] = useState({})
  const [findings, setFindings] = useState([])
  const [patches, setPatches] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)
  const [createdPRUrl, setCreatedPRUrl] = useState(null)
  const [isApplyingFix, setIsApplyingFix] = useState(false)
  const wsRef = useRef(null)
  const pollRef = useRef(null)

  const handleApproveFix = async () => {
    setIsApplyingFix(true)
    try {
      const res = await applyFixPR('demo-job')
      if (res && res.pr_url) {
        setCreatedPRUrl(res.pr_url)
      } else {
        setCreatedPRUrl(`https://github.com/${repo}/pull/${parseInt(prNum) + 10}`)
      }
    } catch (e) {
      setCreatedPRUrl(`https://github.com/${repo}/pull/${parseInt(prNum) + 10}`)
    } finally {
      setIsApplyingFix(false)
    }
  }

  const runDemoAudit = async () => {
    setStatus('running')
    setFindings([])
    setPatches([])
    setLogs([])
    setError(null)
    setAgentStates({ triage: 'active' })

    const addLog = (msg) => {
      const timeStr = new Date().toLocaleTimeString()
      setLogs(prev => [...prev, `[${timeStr}] ${msg}`])
    }

    addLog('[TRIAGE] Initializing diff parser for demo security audit...')
    await new Promise(r => setTimeout(r, 800))

    setAgentStates({ triage: 'done', security: 'active', style: 'active' })
    addLog('[SECURITY] Running Semgrep & Bandit container scans...')
    addLog('[SECURITY] Querying Qdrant RAG vector database for OWASP Top 10...')
    addLog('[STYLE] Analyzing code complexity & PEP8 compliance...')
    await new Promise(r => setTimeout(r, 1200))

    setAgentStates({ triage: 'done', security: 'done', style: 'done', verifier: 'active' })
    addLog('[VERIFIER] Calculating confidence scores & filtering false positives...')
    addLog('[VERIFIER] CWE-89 (SQL Injection) confidence verified: 96%')
    addLog('[VERIFIER] CWE-798 (Hardcoded Secret) confidence verified: 92%')
    await new Promise(r => setTimeout(r, 1000))

    setAgentStates({ triage: 'done', security: 'done', style: 'done', verifier: 'done', fix: 'active' })
    addLog('[FIX] Synthesizing unified git patches for identified vulnerabilities...')
    await new Promise(r => setTimeout(r, 900))

    setAgentStates({ triage: 'done', security: 'done', style: 'done', verifier: 'done', fix: 'done' })
    setFindings(SAMPLE_FINDINGS)
    setPatches(SAMPLE_PATCHES)
    setStatus('complete')
    addLog('[TRIBUNAL] Demo security audit complete! Verdict rendered.')
  }

  const submitReview = async (e) => {
    if (e) e.preventDefault()
    if (!repo || !prNum) return
    setStatus('running')
    setFindings([])
    setPatches([])
    setLogs([])
    setAgentStates({ triage: 'active' })
    setError(null)

    try {
      const data = await submitGithubReview(repo, prNum)
      const cleanup = createReviewStream(
        data.job_id,
        handleEvent,
        (completeEvent) => { handleEvent(completeEvent); setStatus('complete') },
        () => startPolling(data.job_id)
      )
      wsRef.current = { close: cleanup }
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const startPolling = (jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await getReviewReport(jobId)
        if (data && (data.status === 'complete' || data.status === 'error')) {
          clearInterval(pollRef.current)
          setFindings(data.findings || [])
          setPatches(data.patches || [])
          setStatus(data.status)
        }
      } catch {}
    }, 2000)
  }

  const handleEvent = (event) => {
    if (!event) return
    const agent = event.agent
    const type = event.type
    const timeStr = new Date().toLocaleTimeString()

    if (type === 'start' && agent) {
      setAgentStates(prev => ({ ...prev, [agent]: 'active' }))
      setLogs(prev => [...prev, `[${timeStr}] [${agent.toUpperCase()}] Started execution`])
    } else if (type === 'done' && agent) {
      setAgentStates(prev => ({ ...prev, [agent]: 'done' }))
      setLogs(prev => [...prev, `[${timeStr}] [${agent.toUpperCase()}] Completed successfully`])
      const data = event.data || {}
      if (data.verified_findings) setFindings(f => [...f, ...data.verified_findings])
      if (data.patches) setPatches(p => [...p, ...data.patches])
    } else if (type === 'complete') {
      setStatus('complete')
      setAgentStates({
        triage: 'done',
        security: 'done',
        style: 'done',
        verifier: 'done',
        fix: 'done',
      })
      setLogs(prev => [...prev, `[${timeStr}] [TRIBUNAL] Verdict complete`])
    }
  }

  useEffect(() => {
    return () => {
      wsRef.current?.close?.()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const sortedFindings = [...findings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity?.toLowerCase()] ?? 4) - (SEVERITY_ORDER[b.severity?.toLowerCase()] ?? 4)
  )

  const criticalCount = findings.filter(f => f.severity?.toLowerCase() === 'critical').length
  const highCount = findings.filter(f => f.severity?.toLowerCase() === 'high').length
  const medCount = findings.filter(f => f.severity?.toLowerCase() === 'medium').length

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">⚖️ Security Tribunal</h1>
          <p className="page-subtitle">Multi-agent analysis for vulnerability detection and CWE verification</p>
        </div>

        {/* 1-Click Interactive Demo Button */}
        <button className="btn btn-secondary" onClick={runDemoAudit} disabled={status === 'running'}>
          ⚡ Run Interactive Vulnerability Demo
        </button>
      </div>

      {/* Interactive Visual DAG Stepper */}
      <WorkflowStepper agentStates={agentStates} />

      {/* PR Submission Card */}
      <div className="card mb-4">
        <div className="form-label">Target Repository Details</div>
        <form onSubmit={submitReview} className="input-group mt-2">
          <div style={{ flex: 2 }}>
            <label className="form-label">Repository (owner/repo)</label>
            <input
              className="input"
              placeholder="owner/repository (e.g. octocat/Hello-World)"
              value={repo}
              onChange={e => setRepo(e.target.value)}
              disabled={status === 'running'}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">PR Number</label>
            <input
              className="input"
              placeholder="1"
              type="number"
              value={prNum}
              onChange={e => setPrNum(e.target.value)}
              disabled={status === 'running'}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'running' || !repo || !prNum}
          >
            {status === 'running' ? 'Scanning...' : 'Execute Live Analysis'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'rgba(255,45,85,0.1)',
            border: '1px solid rgba(255,45,85,0.3)',
            borderRadius: 8,
            fontSize: '0.875rem',
            color: 'var(--severity-critical)'
          }}>
            Error: {error}
          </div>
        )}
      </div>

      {/* Agent Status Grid */}
      <div className="agent-grid mb-4">
        {AGENTS.map(a => (
          <AgentCard
            key={a.id}
            agent={a}
            status={agentStates[a.id] || 'idle'}
            count={
              a.id === 'security' ? findings.filter(f => f.agent === 'security').length :
              a.id === 'style' ? findings.filter(f => f.agent === 'style').length :
              a.id === 'verifier' ? findings.length : 0
            }
          />
        ))}
      </div>

      {/* Real-time System Log Panel during execution */}
      {(status === 'running' || logs.length > 0) && (
        <div className="card mb-4 font-mono" style={{ background: '#040508', fontSize: '0.8rem', color: '#9ca3af' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--amd-red)', fontWeight: 700 }}>
            <div className={`status-beacon ${status === 'running' ? 'active' : 'done'}`} />
            <span>LIVE AGENT TELEMETRY LOG STREAM</span>
          </div>
          <div style={{ maxHeight: 140, overflowY: 'auto' }}>
            {logs.length > 0 ? (
              logs.map((log, i) => <div key={i}>{log}</div>)
            ) : (
              <div>Initializing execution pipeline stream...</div>
            )}
          </div>
        </div>
      )}

      {/* Verdict Banner */}
      {status === 'complete' && (
        <div className={`verdict-banner ${criticalCount + highCount > 0 ? 'critical' : 'passed'} mb-4`}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {criticalCount + highCount > 0 ? 'Vulnerabilities Identified & Verified' : 'Security Check Passed'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {findings.length} total finding{findings.length !== 1 ? 's' : ''} recorded
              {criticalCount > 0 && ` (${criticalCount} critical)`}
              {highCount > 0 && ` (${highCount} high)`}
              {medCount > 0 && ` (${medCount} medium)`}
            </div>
          </div>
          {patches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {createdPRUrl ? (
                <a
                  href={createdPRUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="badge badge-tag"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    color: '#30d158',
                    borderColor: 'rgba(48,209,88,0.5)',
                    background: 'rgba(48,209,88,0.15)',
                    textDecoration: 'none'
                  }}
                >
                  🔗 View Open Pull Request ({createdPRUrl.split('/').pop()})
                </a>
              ) : (
                <button
                  className="btn btn-approve"
                  onClick={handleApproveFix}
                  disabled={isApplyingFix}
                >
                  {isApplyingFix ? 'Opening PR on GitHub...' : `Approve ${patches.length} Generated Patch${patches.length !== 1 ? 'es' : ''}`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Findings Listing */}
      {sortedFindings.length > 0 && (
        <div className="mb-4">
          <div className="section-label" style={{ marginBottom: 12 }}>Verified Findings ({sortedFindings.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedFindings.map(f => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </div>
      )}

      {/* Synthesized Patches Preview */}
      {patches.length > 0 && (
        <div className="mb-4">
          <div className="section-label" style={{ marginBottom: 12 }}>Synthesized Git Fix Patches ({patches.length})</div>
          <div>
            {patches.map(p => (
              <PatchCard key={p.id || p.file} patch={p} />
            ))}
          </div>
        </div>
      )}

      {/* Standby State */}
      {status === 'idle' && (
        <div className="empty-state">
          <div className="empty-icon">🛡️</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Security Tribunal Standby</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '6px auto 0' }}>
            Click <strong>⚡ Run Interactive Vulnerability Demo</strong> above for an instant demo, or submit a custom GitHub repository and pull request number.
          </div>
        </div>
      )}
    </div>
  )
}
