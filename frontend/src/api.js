/**
 * THEMIS API Client
 * Handles all communication with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || ''
const API_KEY  = import.meta.env.VITE_API_KEY  || 'themis-dev-key-change-in-prod'
const WS_BASE  = import.meta.env.VITE_WS_URL   || ''

const headers = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
})

// ── Review Endpoints ──────────────────────────────────────────

export async function submitGithubReview(repo, prNumber) {
  const res = await fetch(`${API_BASE}/api/review/github`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ repo, pr_number: parseInt(prNumber) }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getReviewStatus(jobId) {
  const res = await fetch(`${API_BASE}/api/review/${jobId}/status`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getReviewReport(jobId) {
  const res = await fetch(`${API_BASE}/api/review/${jobId}/report`, {
    headers: headers(),
  })
  if (res.status === 202) return null   // Still in progress
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function approveFix(jobId, threadId) {
  const res = await fetch(`${API_BASE}/api/review/${jobId}/approve-fix`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ thread_id: threadId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function applyFixPR(jobId) {
  const res = await fetch(`${API_BASE}/api/review/${jobId}/apply-fix`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Benchmark Endpoints ───────────────────────────────────────

export async function runBenchmark() {
  const res = await fetch(`${API_BASE}/api/benchmark/run`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getBenchmarkHealth() {
  const res = await fetch(`${API_BASE}/api/benchmark/health`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`)
  return res.ok
}

// ── WebSocket Streaming ───────────────────────────────────────

export function createReviewStream(jobId, onEvent, onDone, onError) {
  const wsUrl = `${WS_BASE}/api/review/${jobId}/stream`.replace(/^http/, 'ws')
  const ws = new WebSocket(wsUrl)

  ws.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data)
      if (event.type === 'complete') {
        onDone(event)
        ws.close()
      } else {
        onEvent(event)
      }
    } catch {}
  }

  ws.onerror = onError
  ws.onclose = () => {}

  return () => ws.close() // Return cleanup fn
}
