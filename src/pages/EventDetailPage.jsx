import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiUser, FiMail, FiPhone, FiBook, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { getEventById, createRegistration, checkExistingRegistration } from '../services/supabase'
import { mockEvents, categoryColors } from '../utils/mockData'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year']

const initialForm = { name: '', email: '', phone: '', college: '', department: '', year: '' }
const initialErrors = { name: '', email: '', phone: '', college: '', department: '', year: '' }

const validate = (form) => {
  const errors = { ...initialErrors }
  let valid = true
  if (!form.name.trim() || form.name.trim().length < 2) { errors.name = 'Full name is required (min 2 chars)'; valid = false }
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Valid email address required'; valid = false }
  if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) { errors.phone = 'Valid 10-digit Indian phone number required'; valid = false }
  if (!form.college.trim() || form.college.trim().length < 3) { errors.college = 'College name is required'; valid = false }
  if (!form.department.trim() || form.department.trim().length < 2) { errors.department = 'Department is required'; valid = false }
  if (!form.year) { errors.year = 'Year of study is required'; valid = false }
  return { errors, valid }
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState(initialErrors)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  // Razorpay payment simulation states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [upiId, setUpiId] = useState('hemu@okhdfcbank')
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvv, setCardCvv] = useState('123')
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id)
        setEvent(data)
      } catch {
        const mock = mockEvents.find(e => e.id === id)
        setEvent(mock || null)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const { errors: newErrors, valid } = validate(form)
    setErrors(newErrors)
    if (!valid) return

    setSubmitting(true)
    try {
      const alreadyRegistered = await checkExistingRegistration(id, form.email)
      if (alreadyRegistered) {
        setSubmitError('This email is already registered for this event.')
        setSubmitting(false)
        return
      }
      
      if (event && event.fee > 0) {
        setShowPaymentModal(true)
        setSubmitting(false)
      } else {
        await completeRegistration(null)
      }
    } catch {
      if (event && event.fee > 0) {
        setShowPaymentModal(true)
        setSubmitting(false)
      } else {
        await completeRegistration(null)
      }
    }
  }

  const completeRegistration = async (paymentId) => {
    setSubmitting(true)
    try {
      const registration = await createRegistration({
        event_id: id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        college: form.college.trim(),
        department: form.department.trim(),
        year: form.year,
        payment_id: paymentId || 'FREE',
      })
      navigate('/success', { state: { registration, event } })
    } catch (err) {
      // Demo mode - generate a local registration ID for demonstration
      const regId = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      const demoRegistration = {
        registration_id: regId,
        event_id: id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        college: form.college.trim(),
        department: form.department.trim(),
        year: form.year,
        payment_id: paymentId || 'FREE',
        created_at: new Date().toISOString(),
      }
      
      // Save locally to window so admin page can pull it in offline/demo mode!
      window.localRegistrations = window.localRegistrations || []
      window.localRegistrations.push({
        ...demoRegistration,
        events: { title: event.title, date: event.date, venue: event.venue }
      })

      navigate('/success', { state: { registration: demoRegistration, event } })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    setPaymentProcessing(true)
    
    setTimeout(() => {
      const payId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
      setPaymentProcessing(false)
      setShowPaymentModal(false)
      completeRegistration(payId)
    }, 1800)
  }

  if (loading) return (
    <div className="min-h-screen mesh-bg pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-teal border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-semibold">Loading event details...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen mesh-bg pt-20 flex items-center justify-center text-center px-6">
      <div>
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-teal mb-2">Event Not Found</h2>
        <p className="text-slate-600 mb-6 font-semibold">The event you're looking for doesn't exist.</p>
        <Link to="/events" className="btn-primary">Browse Events</Link>
      </div>
    </div>
  )

  const colors = categoryColors[event.category] || categoryColors.Technology

  return (
    <div className="min-h-screen mesh-bg pt-20">
      {/* Hero Image Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'}
          alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(13,61,58,0.15) 0%, rgba(13,61,58,0.92) 100%)'
        }} />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/events" className="inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white mb-4 transition-colors duration-200 font-semibold">
              <FiArrowLeft size={14} /> Back to Events
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge text-xs"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                {event.category}
              </span>
              <span className="badge text-xs"
                style={{ background: 'rgba(201, 146, 58, 0.2)', color: '#e8b060', border: '1px solid rgba(201, 146, 58, 0.4)' }}>
                {event.fee === 0 ? 'FREE' : `₹${event.fee}`}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FiCalendar, label: 'Date', value: event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBA', color: '#0d3d3a' },
                { icon: FiClock, label: 'Time', value: event.time || 'TBA', color: '#145c57' },
                { icon: FiMapPin, label: 'Venue', value: event.venue, color: '#c9923a' },
                { icon: FiUsers, label: 'Seats', value: `${event.seats} seats`, color: '#a84b2f' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="glass-card p-4 text-center"
                  style={{ borderRadius: '1rem' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="text-xs text-slate-500 mb-1 font-semibold">{label}</div>
                  <div className="text-xs font-extrabold text-teal leading-tight">{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="glass-card p-6" style={{ borderRadius: '1.25rem' }}>
              <h3 className="text-lg font-bold text-teal mb-4">About This Event</h3>
              <p className="text-slate-600 leading-relaxed text-sm font-semibold">{event.description}</p>
            </div>

            {/* Organizer */}
            <div className="glass-card p-5 flex items-center gap-4" style={{ borderRadius: '1.25rem' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(13, 61, 58, 0.05)', border: '1px solid rgba(13, 61, 58, 0.2)' }}>
                <FiUser size={20} className="text-teal" />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5 font-semibold">Organized by</div>
                <div className="font-extrabold text-teal">{event.organizer || 'Event Committee'}</div>
              </div>
            </div>
          </div>

          {/* Right - Registration Form */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24" style={{ borderRadius: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal">
                  <FiCheckCircle size={14} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-teal">Register Now</h3>
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
                  style={{ background: 'rgba(168,75,47,0.1)', border: '1px solid rgba(168,75,47,0.3)', color: '#a84b2f' }}>
                  <FiAlertCircle size={14} />
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <FiUser size={11} className="inline mr-1 text-gold" /> Full Name *
                  </label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="John Doe" className="input-field" required />
                  {errors.name && <p className="text-xs mt-1" style={{ color: '#a84b2f' }}>{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <FiMail size={11} className="inline mr-1 text-gold" /> Email Address *
                  </label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="john@example.com" className="input-field" required />
                  {errors.email && <p className="text-xs mt-1" style={{ color: '#a84b2f' }}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <FiPhone size={11} className="inline mr-1 text-gold" /> Phone Number *
                  </label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="9876543210" className="input-field" required />
                  {errors.phone && <p className="text-xs mt-1" style={{ color: '#a84b2f' }}>{errors.phone}</p>}
                </div>

                {/* College */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <FiBook size={11} className="inline mr-1 text-gold" /> College / Institution *
                  </label>
                  <input name="college" value={form.college} onChange={handleChange}
                    placeholder="IIT Bombay" className="input-field" required />
                  {errors.college && <p className="text-xs mt-1" style={{ color: '#a84b2f' }}>{errors.college}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Department *
                  </label>
                  <input name="department" value={form.department} onChange={handleChange}
                    placeholder="Computer Science" className="input-field" required />
                  {errors.department && <p className="text-xs mt-1" style={{ color: '#a84b2f' }}>{errors.department}</p>}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Year of Study *
                  </label>
                  <select name="year" value={form.year} onChange={handleChange} className="input-field" required>
                    <option value="">Select Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.year && <p className="text-xs mt-1" style={{ color: '#a84b2f' }}>{errors.year}</p>}
                </div>

                {/* Fee reminder */}
                <div className="p-3 rounded-xl text-center text-xs font-bold"
                  style={{ background: 'rgba(13,61,58,0.05)', border: '1px solid rgba(13,61,58,0.15)', color: '#0d3d3a' }}>
                  Registration Fee: <span className="font-extrabold">{event.fee === 0 ? 'FREE' : `₹${event.fee}`}</span>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                  {submitting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Processing...</>
                  ) : (
                    <><FiCheckCircle size={15} /> Complete Registration</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Payment Simulator Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-border-ivory overflow-hidden p-6 rounded-2xl shadow-glow text-center">
            <h3 className="text-xl font-black text-teal mb-1">UPI Payment Gateway</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto mb-4">
              Scan the QR code below or use your favorite UPI banking app to make the payment.
            </p>

            {/* Dynamic QR Code Generator */}
            {(() => {
              const upiAmount = event.fee.toFixed(2);
              const upiLink = `upi://pay?pa=8309305811@ybl&pn=Hemachandra&am=${upiAmount}&cu=INR`;
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
              
              return (
                <>
                  {/* QR Display */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl mb-4 border border-border-ivory shadow-inner">
                    <img 
                      src={qrUrl} 
                      alt="UPI Payment QR Code" 
                      className="w-[160px] h-[160px] object-contain"
                    />
                    <span className="text-[9px] text-slate-800 font-extrabold mt-2 uppercase tracking-wider">
                      Scan to Pay: ₹{upiAmount}
                    </span>
                  </div>

                  {/* Copy UPI ID Box */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border-ivory bg-slate-50 mb-3">
                    <div className="text-left">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">UPI ID</span>
                      <span className="text-xs font-mono text-teal font-bold select-all">8309305811@ybl</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('8309305811@ybl');
                        alert('UPI ID copied to clipboard!');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase bg-white hover:bg-slate-100 text-teal border border-border-ivory active:scale-95 transition-all"
                    >
                      Copy ID
                    </button>
                  </div>

                  {/* Open in App Deep Link */}
                  <a
                    href={upiLink}
                    className="w-full py-2.5 mb-4 rounded-xl border border-teal/20 hover:bg-teal/5 font-extrabold text-xs text-teal transition-all flex items-center justify-center gap-1.5"
                  >
                    Open in UPI App
                  </a>
                </>
              );
            })()}

            {/* Confirm & Cancel Buttons */}
            <button
              onClick={() => {
                const payId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
                setShowPaymentModal(false);
                completeRegistration(payId);
              }}
              className="w-full py-3 rounded-xl bg-teal text-white hover:opacity-95 font-extrabold text-xs shadow-lg shadow-teal/20 transition-all flex items-center justify-center gap-2 mb-3"
            >
              I Have Completed Payment
            </button>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-2 text-slate-500 hover:text-teal font-bold text-[11px] transition-all"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
