import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FiCheckCircle, FiDownload, FiCalendar, FiMapPin, FiUser, FiMail, FiPhone, FiBook, FiArrowRight } from 'react-icons/fi'
import { format } from 'date-fns'
import { generateRegistrationPDF } from '../utils/pdfGenerator'

export default function SuccessPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state?.registration) {
      navigate('/events')
    }
  }, [state, navigate])

  if (!state?.registration) return null

  const { registration, event } = state

  const handleDownload = () => {
    generateRegistrationPDF(registration, event)
  }

  const formattedDate = event?.date ? format(new Date(event.date), 'EEEE, MMMM dd, yyyy') : 'TBA'
  const issuedAt = registration.created_at ? format(new Date(registration.created_at), 'dd MMM yyyy, hh:mm a') : format(new Date(), 'dd MMM yyyy, hh:mm a')

  return (
    <div className="min-h-screen mesh-bg pt-20 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10 pt-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(13,61,58,0.06)', border: '2px solid rgba(13,61,58,0.2)' }}>
              <FiCheckCircle size={44} className="text-teal" />
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-10"
              style={{ background: 'rgba(13,61,58,0.2)', animationDuration: '2s' }} />
          </div>
          <h1 className="text-4xl font-black text-teal mb-3">
            Registration <span style={{
              background: 'linear-gradient(135deg, #0d3d3a, #c9923a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Confirmed!</span>
          </h1>
          <p className="text-slate-600 font-semibold">
            Your spot is reserved. Download your confirmation PDF below.
          </p>
        </div>

        {/* Registration ID & Ticket Card */}
        <div className="glass-card p-6 mb-5 text-center flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: 'linear-gradient(135deg, rgba(13,61,58,0.06) 0%, rgba(201,146,58,0.04) 100%)', borderRadius: '1.25rem' }}>
          
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Registration ID</div>
            <div className="text-3xl font-black tracking-wider mb-2 text-teal">
              {registration.registration_id}
            </div>
            <div className="text-xs text-slate-500 mb-4 font-semibold">Issued on {issuedAt}</div>
            
            {/* Payment Details */}
            <div className="inline-flex flex-col gap-1 text-left p-3 rounded-xl bg-slate-50 border border-border-ivory">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Payment Details</div>
              <div className="text-xs text-slate-600 font-semibold">
                Method: <span className="font-extrabold text-teal uppercase">{event?.fee === 0 ? 'FREE' : 'UPI GATEWAY'}</span>
              </div>
              <div className="text-xs text-slate-600 font-semibold">
                TXN ID: <span className="font-mono text-teal font-extrabold">{registration.payment_id || 'FREE'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl flex-shrink-0" style={{ boxShadow: '0 6px 15px rgba(13,61,58,0.08)', border: '1px solid #ddd3c4' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&color=0d3d3a&data=${registration.registration_id}`} 
              alt="Registration QR Code" 
              className="w-32 h-32"
            />
            <div className="text-[10px] font-black text-slate-800 tracking-wider uppercase mt-1">Scan to Validate</div>
          </div>

        </div>

        {/* Event Details */}
        <div className="glass-card p-6 mb-5" style={{ borderRadius: '1.25rem' }}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Event Details</h3>
          {event?.image && (
            <div className="h-40 rounded-xl overflow-hidden mb-4 border border-border-ivory">
              <img src={event.image} alt={event?.title} className="w-full h-full object-cover" />
            </div>
          )}
          <h4 className="text-xl font-black text-teal mb-4">{event?.title}</h4>
          <div className="flex flex-col gap-3">
            {[
              { icon: FiCalendar, label: 'Date', value: formattedDate, color: '#0d3d3a' },
              { icon: FiMapPin, label: 'Venue', value: event?.venue, color: '#c9923a' },
            ].filter(item => item.value).map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">{label}</div>
                  <div className="text-sm font-extrabold text-teal">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participant Details */}
        <div className="glass-card p-6 mb-6" style={{ borderRadius: '1.25rem' }}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Participant Details</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: FiUser, label: 'Full Name', value: registration.name },
              { icon: FiMail, label: 'Email', value: registration.email },
              { icon: FiPhone, label: 'Phone', value: registration.phone },
              { icon: FiBook, label: 'College', value: registration.college },
              { icon: FiBook, label: 'Department', value: registration.department },
              { icon: FiUser, label: 'Year', value: registration.year },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid #ddd3c4' }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} className="text-slate-500" />
                  <span className="text-xs text-slate-500 font-semibold">{label}</span>
                </div>
                <span className="text-sm font-extrabold text-teal">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleDownload}
            className="btn-primary flex-1 justify-center py-3.5 text-sm cursor-pointer">
            <FiDownload size={16} /> Download PDF Confirmation
          </button>
          <Link to="/events" className="btn-outline flex-1 justify-center py-3.5 text-sm">
            Browse More Events <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
          Present your Registration ID or PDF at the event venue for entry. Save the PDF for your records.
        </p>
      </div>
    </div>
  )
}
