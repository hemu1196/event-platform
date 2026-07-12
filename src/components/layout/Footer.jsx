import { Link } from 'react-router-dom'
import { FiCalendar, FiMail, FiPhone, FiMapPin, FiTwitter, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer style={{ background: '#061f1d', borderTop: '1px solid #c9923a' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0d3d3a, #145c57)' }}>
                <FiCalendar className="text-white text-base" />
              </div>
              <span className="font-bold text-xl text-white">
                Event<span style={{ color: '#e8b060' }}>Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(250,247,242,0.7)' }}>
              Premium college event management platform. Discover, register, and experience amazing events.
            </p>
            <div className="flex items-center gap-3">
              {[FiTwitter, FiGithub, FiLinkedin, FiInstagram].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(250,247,242,0.7)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,146,58,0.2)'; e.currentTarget.style.color = '#e8b060' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(250,247,242,0.7)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[{ to: '/', label: 'Home' }, { to: '/events', label: 'Browse Events' }, { to: '/admin', label: 'Admin Panel' }].map(link => (
                <Link key={link.to} to={link.to}
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'rgba(250,247,242,0.7)' }}
                  onMouseEnter={e => e.target.style.color = '#e8b060'}
                  onMouseLeave={e => e.target.style.color = 'rgba(250,247,242,0.7)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2.5">
              {['Technology', 'Hackathon', 'Cultural', 'Business', 'Sports', 'Workshop'].map(cat => (
                <Link key={cat} to={`/events?category=${cat}`}
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'rgba(250,247,242,0.7)' }}
                  onMouseEnter={e => e.target.style.color = '#e8b060'}
                  onMouseLeave={e => e.target.style.color = 'rgba(250,247,242,0.7)'}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3">
              {[
                { Icon: FiMail, text: 'pinjalahemachandra469@gmail.com' },
                { Icon: FiPhone, text: '+91 8309305811' },
                { Icon: FiMapPin, text: 'Tirupati, Andhra Pradesh, India' },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon size={14} style={{ color: '#e8b060' }} />
                  <span className="text-sm" style={{ color: 'rgba(250,247,242,0.7)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/06 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'rgba(250,247,242,0.5)' }}>
            © 2026 EventHub. All rights reserved.
          </p>
          <p className="text-xs text-center md:text-right" style={{ color: 'rgba(250,247,242,0.5)' }}>
            Developed by Hemachandra <br />
            Made for Demo Project with Interest ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
