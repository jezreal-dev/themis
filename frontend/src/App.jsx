import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Shield, Terminal, Activity, Server } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import ReviewPage from './pages/ReviewPage'
import BenchmarkPage from './pages/BenchmarkPage'
import './index.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="logo-icon">
            <Shield size={20} color="#ffffff" />
          </div>
          <span>THEMIS</span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/tribunal" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Terminal size={16} />
            <span>Tribunal</span>
          </NavLink>

          <NavLink to="/benchmark" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={16} />
            <span>Benchmark</span>
          </NavLink>

          <div className="status-online">
            <span className="status-beacon done" style={{ width: 8, height: 8 }} />
            <span>System Online</span>
          </div>

          <span className="nav-badge">
            <Server size={12} style={{ display: 'inline', marginRight: 4 }} />
            AMD ROCm
          </span>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tribunal" element={<ReviewPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/benchmark" element={<BenchmarkPage />} />
      </Routes>
    </BrowserRouter>
  )
}
