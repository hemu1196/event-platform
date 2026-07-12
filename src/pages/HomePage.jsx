import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiUsers, FiStar, FiChevronDown, FiZap, FiAward, FiGlobe } from 'react-icons/fi'
import EventCard from '../components/events/EventCard'
import { getEvents } from '../services/supabase'
import { mockEvents } from '../utils/mockData'

const STATS = [
  { value: '50+', label: 'Events Monthly', icon: FiCalendar, color: '#7c3aed' },
  { value: '10K+', label: 'Registrations', icon: FiUsers, color: '#2563eb' },
  { value: '200+', label: 'Colleges', icon: FiGlobe, color: '#10b981' },
  { value: '98%', label: 'Satisfaction', icon: FiStar, color: '#f59e0b' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    college: 'IIT Bombay',
    role: 'Computer Science, 3rd Year',
    text: 'EventHub made it incredibly easy to register for TechFest. The instant confirmation PDF was super helpful for showing entry at the venue!',
    avatar: 'PS',
    color: '#7c3aed',
  },
  {
    name: 'Arjun Reddy',
    college: 'VIT Vellore',
    role: 'Electronics Engg, 4th Year',
    text: 'Best event portal I have used. The UI is clean, the registration process is seamless, and I love how I can filter events by category.',
    avatar: 'AR',
    color: '#2563eb',
  },
  {
    name: 'Sneha Patel',
    college: 'BITS Pilani',
    role: 'MBA, 2nd Year',
    text: 'Registered for the Business Conclave in under 2 minutes! The platform is so intuitive. Would highly recommend to everyone.',
    avatar: 'SP',
    color: '#10b981',
  },
]

const FAQS = [
  { q: 'How do I register for an event?', a: 'Simply browse events, click "Register Now" on any event that interests you, fill in your details, and submit. You will receive a unique Registration ID instantly.' },
  { q: 'Is my registration confirmed immediately?', a: 'Yes! As soon as you submit the form, your registration is confirmed. You can download a PDF confirmation with all event and participant details.' },
  { q: 'Can I register for multiple events?', a: 'Absolutely! You can register for as many events as you like. Each registration gets a unique ID for tracking.' },
  { q: 'How do I contact event organizers?', a: 'Event organizer contact details are listed on each event\'s detail page. You can also reach us through the contact information in the footer.' },
  { q: 'What if I want to cancel my registration?', a: 'Please contact the event organizer directly or reach out to our support team with your Registration ID for assistance.' },
]

const CATEGORIES = [
  { name: 'Technology', icon: '💻', count: '12 Events', color: '#7c3aed' },
  { name: 'Hackathon', icon: '⚡', count: '8 Events', color: '#10b981' },
  { name: 'Cultural', icon: '🎭', count: '15 Events', color: '#f59e0b' },
  { name: 'Business', icon: '📈', count: '6 Events', color: '#2563eb' },
  { name: 'Sports', icon: '🏆', count: '10 Events', color: '#ef4444' },
  { name: 'Workshop', icon: '🔧', count: '9 Events', color: '#8b5cf6' },
]

export default function HomePage() {
  const [events, setEvents] = useState(mockEvents.slice(0, 3))
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    getEvents()
      .then(data => { if (data.length > 0) setEvents(data.slice(0, 3)) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen mesh-bg">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float"
            style={{ background: 'radial-gradient(circle, #0d3d3a, transparent)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 animate-float"
            style={{ background: 'radial-gradient(circle, #c9923a, transparent)', filter: 'blur(50px)', animationDelay: '3s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-5 animate-float"
            style={{ background: 'radial-gradient(circle, #a84b2f, transparent)', filter: 'blur(40px)', animationDelay: '1.5s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(13,61,58,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,61,58,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
                style={{ background: 'rgba(13, 61, 58, 0.04)', borderColor: 'rgba(13, 61, 58, 0.12)', color: '#0d3d3a' }}>
                <FiZap size={12} className="text-gold" />
                Premium Campus Event & Ticketing Portal
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-teal mb-6 leading-[1.05] tracking-tight">
                Discover & <span className="gradient-text italic font-serif">Experience</span>
                <br />Amazing College Events
              </h1>

              <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed">
                Your gateway to the best college events — tech fests, hackathons, cultural shows, and sports championships. Register in seconds, download your printable pass, and gain entry.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/events" className="btn-primary text-base px-7 py-3.5">
                  Browse Events <FiArrowRight size={16} />
                </Link>
                <Link to="/admin" className="btn-outline text-base px-7 py-3.5">
                  Admin Portal
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-8 mt-14">
                {STATS.map(({ value, label, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(13, 61, 58, 0.04)', border: '1px solid rgba(13, 61, 58, 0.1)' }}>
                      <Icon size={18} className="text-teal" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-teal">{value}</div>
                      <div className="text-xs text-slate-500 font-semibold">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 3D Visual Column */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="idc-stage">
                <div className="idc-mount"></div>
                <div className="idc-rig">
                  <div className="idc-strap"></div>
                  <div className="idc-clip">
                    <div className="idc-loop"></div>
                    <div className="idc-pinch"></div>
                  </div>
                  <div className="idc-card">
                    <div className="idc-ribbon-clip">
                      <div className="idc-ribbon">VIP PASS</div>
                    </div>
                    <div className="idc-card-top">
                      <div className="idc-org">
                        Amrita Vidyapeetham
                        <b>TECH SUMMIT 2026</b>
                      </div>
                      <div className="idc-pass-pill">
                        ENTRY
                        <span>PASS</span>
                      </div>
                    </div>
                    
                    {/* Photo area */}
                    <div className="idc-photo-wrap">
                      <svg className="w-14 h-14 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </div>
                    
                    <div className="idc-name">
                      Aarav <span>Sharma</span>
                    </div>
                    <div className="idc-role-line">Computer Science Student</div>
                    
                    <div className="idc-id-row">
                      <span>ID: EHB-2026-9812</span>
                      <span>ROLL: AM.EN.U4CSE</span>
                    </div>
                    <div className="idc-barcode"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FiChevronDown size={24} className="text-purple-400 opacity-60" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(13, 61, 58, 0.04)', border: '1px solid rgba(13, 61, 58, 0.12)', color: '#0d3d3a' }}>
              <FiAward size={12} className="text-gold" />
              Event Categories
            </div>
            <h2 className="text-4xl font-black text-teal mb-4">
              Explore by <span className="gradient-text italic font-serif">Category</span>
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              From coding hackathons to cultural fests — find events that match your passion and interests.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/events?category=${cat.name}`}
                className="glass-card p-5 text-center flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300"
                style={{ '--hover-border': cat.color }}>
                <div className="text-4xl">{cat.icon}</div>
                <div>
                  <div className="font-extrabold text-teal text-sm">{cat.name}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: cat.color }}>{cat.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-24 px-6 bg-ivory-dark border-t border-b border-border-ivory">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'rgba(13, 61, 58, 0.04)', border: '1px solid rgba(13, 61, 58, 0.12)', color: '#0d3d3a' }}>
                <FiCalendar size={12} className="text-gold" />
                Upcoming Events
              </div>
              <h2 className="text-4xl font-black text-teal">
                Featured <span className="gradient-text italic font-serif">Events</span>
              </h2>
            </div>
            <Link to="/events" className="btn-outline hidden md:flex">
              View All Events <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/events" className="btn-outline">View All Events <FiArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(201, 146, 58, 0.06)', border: '1px solid rgba(201, 146, 58, 0.2)', color: '#c9923a' }}>
              <FiStar size={12} />
              Testimonials
            </div>
            <h2 className="text-4xl font-black text-teal mb-4">
              What Students <span className="gradient-text italic font-serif">Are Saying</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <FiStar key={j} size={14} fill="#c9923a" style={{ color: '#c9923a' }} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-extrabold text-teal text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500 font-semibold">{t.role}</div>
                    <div className="text-xs font-bold" style={{ color: t.color }}>{t.college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-ivory-dark border-t border-b border-border-ivory">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-teal mb-4">
              Frequently Asked <span className="gradient-text italic font-serif">Questions</span>
            </h2>
            <p className="text-slate-600 font-semibold">Everything you need to know about EventHub</p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card overflow-hidden"
                style={{ transition: 'all 0.3s ease', borderRadius: '1rem' }}>
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-extrabold text-teal text-sm pr-4">{faq.q}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: openFaq === i ? 'rgba(13, 61, 58, 0.1)' : 'rgba(13, 61, 58, 0.04)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'none',
                    }}>
                    <FiChevronDown size={14} className="text-teal" />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d3d3a 0%, #061f1d 100%)', border: '1px solid #c9923a' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #e8b060, transparent)', filter: 'blur(40px)' }} />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #145c57, transparent)', filter: 'blur(40px)' }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to Discover Your Next <span className="gradient-text italic font-serif">Big Event?</span>
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto font-medium">
                Join thousands of students who use EventHub to discover amazing events and create unforgettable memories.
              </p>
              <Link to="/events" className="btn-primary text-base px-8 py-4 bg-white text-teal hover:bg-slate-100 hover:text-teal shadow-none">
                Explore All Events <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
