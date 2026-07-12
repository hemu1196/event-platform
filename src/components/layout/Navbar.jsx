import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiCalendar } from 'react-icons/fi'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(250, 247, 242, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #ddd3c4' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" 
              style={{ background: 'linear-gradient(135deg, #0d3d3a, #145c57)' }}>
              <FiCalendar className="text-white text-base" />
            </div>
            <span className="font-bold text-xl text-teal">
              Event<span style={{ color: '#c9923a' }}>Hub</span>
            </span>
          </Link>
 
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-bold transition-colors duration-200"
                style={{
                  color: location.pathname === link.to ? '#0d3d3a' : '#4a3f35',
                }}
                onMouseEnter={e => e.target.style.color = '#0d3d3a'}
                onMouseLeave={e => e.target.style.color = location.pathname === link.to ? '#0d3d3a' : '#4a3f35'}
              >
                {link.label}
              </Link>
            ))}
          </div>
 
          <div className="hidden md:flex items-center gap-3">
            <Link to="/admin" className="btn-outline text-sm py-2 px-4">
              Admin
            </Link>
            <Link to="/events" className="btn-primary text-sm py-2 px-4">
              Browse Events
            </Link>
          </div>
 
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-teal p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
 
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border-ivory">
            <div className="flex flex-col gap-3">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className="text-sm font-bold px-2 py-2"
                  style={{ color: location.pathname === link.to ? '#0d3d3a' : '#4a3f35' }}>
                  {link.label}
                </Link>
              ))}
              <Link to="/admin" className="btn-outline text-sm py-2 text-center mt-2">Admin</Link>
              <Link to="/events" className="btn-primary text-sm py-2 text-center">Browse Events</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
