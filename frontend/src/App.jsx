import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ReviewPage from './pages/ReviewPage'
import BenchmarkPage from './pages/BenchmarkPage'
import './index.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="logo-icon">🛡️</div>
          <span>THEMIS</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/review" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Tribunal
          </NavLink>
          <NavLink to="/benchmark" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Benchmark
          </NavLink>
          <span className="nav-badge">AMD ROCm</span>
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
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/benchmark" element={<BenchmarkPage />} />
      </Routes>
    </BrowserRouter>
  )
}
