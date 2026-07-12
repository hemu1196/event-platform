import { Link } from 'react-router-dom'
import { FiCalendar, FiMapPin, FiUsers, FiArrowRight } from 'react-icons/fi'
import { format } from 'date-fns'
import { categoryColors } from '../../utils/mockData'

const EventCard = ({ event }) => {
  const colors = categoryColors[event.category] || categoryColors.Technology
  const formattedDate = event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'TBA'

  return (
    <div className="glass-card overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(13,61,58,0.7) 0%, transparent 60%)'
        }} />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge text-xs"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
            {event.category}
          </span>
        </div>
        {/* Fee badge */}
        <div className="absolute top-3 right-3">
          <span className="badge text-xs"
            style={{ background: 'rgba(201,146,58,0.12)', color: '#c9923a', border: '1px solid rgba(201,146,58,0.3)' }}>
            {event.fee === 0 ? 'FREE' : `₹${event.fee}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-teal text-base mb-2 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-200">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <FiCalendar size={13} className="text-teal" />
            <span className="text-xs">{formattedDate} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <FiMapPin size={13} className="text-gold" />
            <span className="text-xs line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <FiUsers size={13} className="text-rust" />
            <span className="text-xs">{event.seats} seats available</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link
            to={`/events/${event.id}`}
            className="btn-primary w-full justify-center text-sm py-2.5 cursor-pointer"
          >
            Register Now <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EventCard
