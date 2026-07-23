import { useNavigate } from 'react-router-dom'
import {
  Shield,
  ShieldCheck,
  Cpu,
  GitBranch,
  Database,
  Lock,
  Activity,
  Terminal,
  BarChart3,
  Layers,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

const FEATURES = [
  {
    icon: Layers,
    accent: '#a855f7',
    title: '5-Agent Parallel Tribunal',
    desc: 'Specialized node execution for triage, static security analysis, style validation, confidence verification, and patch generation.'
  },
  {
    icon: Database,
    accent: '#00f0ff',
    title: 'Grounded Vector RAG',
    desc: 'Dense embeddings and Qdrant vector search cross-reference findings directly against verified OWASP and CWE databases.'
  },
  {
    icon: Cpu,
    accent: '#ff2d55',
    title: 'AMD Hardware Acceleration',
    desc: 'Qwen2.5-Coder-32B INT4 AWQ inference hosted on 48GB VRAM with ROCm 7.2.1 optimization.'
  },
  {
    icon: Lock,
    accent: '#ffd60a',
    title: 'Human Approval Gate',
    desc: 'Automated patch generation requires human verification before opening pull requests.'
  },
  {
    icon: ShieldCheck,
    accent: '#30d158',
    title: 'Isolated Execution',
    desc: 'Static analysis tools run in ephemeral containers with restricted system permissions and zero network egress.'
  },
  {
    icon: Activity,
    accent: '#ff6b35',
    title: 'Hardware Telemetry',
    desc: 'Real-time throughput metrics, latency timing, and time-to-first-token benchmarks.'
  }
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 16px',
        background: 'rgba(232, 0, 61, 0.1)',
        border: '1px solid rgba(232, 0, 61, 0.3)',
        borderRadius: 999,
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--amd-red)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: 24
      }}>
        <Sparkles size={14} />
        <span>AMD AI DevMaster Hackathon 2026 : Team Alchemy</span>
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1.1,
        marginBottom: 20,
        maxWidth: 900,
        margin: '0 auto 20px'
      }}>
        Autonomous Code Review & Security Analysis Platform
      </h1>

      {/* Subtitle */}
      <p className="page-subtitle" style={{ margin: '0 auto 36px', fontSize: '1.05rem', maxWidth: 680 }}>
        THEMIS deploys five specialized AI agents to inspect pull requests, identify vulnerabilities, verify CWE compliance, and generate validated fixes on AMD Radeon hardware.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/tribunal')}>
          <Shield size={18} />
          <span>Launch Tribunal Console</span>
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/benchmark')}>
          <BarChart3 size={18} />
          <span>View Telemetry Benchmarks</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="metric-grid" style={{ maxWidth: 960, margin: '0 auto 64px' }}>
        <div className="metric-card">
          <div className="metric-value">32B</div>
          <div className="metric-label">Model Parameters</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">AWQ</div>
          <div className="metric-label">INT4 Quantization</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">5</div>
          <div className="metric-label">Tribunal Agents</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">48GB</div>
          <div className="metric-label">AMD GPU VRAM</div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="section-label" style={{ marginBottom: 20 }}>System Capabilities</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
        maxWidth: 1100,
        margin: '0 auto 64px',
        textAlign: 'left'
      }}>
        {FEATURES.map(f => {
          const IconComponent = f.icon
          return (
            <div key={f.title} className="card card-interactive">
              <div style={{ color: f.accent, marginBottom: 14 }}>
                <IconComponent size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Agent Workflow */}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="section-label" style={{ marginBottom: 16 }}>Agent Pipeline Architecture</div>
        <div className="pipeline-container" style={{ justifyContent: 'center' }}>
          {['Triage Engine', '→', 'Security RAG', 'Style Engine', '→', 'Verifier Gate', '→', 'Fix Generator', '→', 'Human Approval'].map((step, i) => (
            step === '→' ? (
              <span key={i} className="pipeline-arrow">→</span>
            ) : (
              <span key={i} className="pipeline-node">
                {step}
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
