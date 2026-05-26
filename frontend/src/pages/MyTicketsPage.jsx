import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, ArrowRight, BookOpen, Clock, CheckCircle } from 'lucide-react';

const MyTicketsPage = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve ticket history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg">
      {/* Background glow glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none animate-pulse-glow" />

      <section className="max-w-6xl mx-auto px-6 md:px-12 pt-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2 text-primary-light font-semibold">
            <Ticket className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Student Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">My Ticket Passes</h1>
          <p className="text-sm text-dark-muted font-medium">Access your digital QR registration tickets and check-in status.</p>
        </div>

        {tickets.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-dark-border rounded-2xl bg-white/[0.01]">
            <div className="inline-flex p-4 rounded-full bg-white/5 border border-white/5 text-dark-muted mb-4">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Active Tickets Found</h3>
            <p className="text-sm text-dark-dim max-w-sm mx-auto mb-6">You haven't registered for any events yet. Explore upcoming summits on the campus portal!</p>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/10 transition-all inline-flex items-center gap-1.5 hover:scale-[1.01]"
            >
              Browse Campus Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {tickets.map((ticket) => {
              const isUsed = ticket.is_used;
              return (
                <motion.div
                  key={ticket.id}
                  variants={itemVariants}
                  className="rounded-2xl border glass-card overflow-hidden flex flex-col sm:flex-row shadow-xl relative"
                >
                  {/* Left Side Image preview */}
                  <div className="w-full sm:w-44 h-40 sm:h-auto overflow-hidden relative flex-shrink-0">
                    <img
                      src={ticket.event?.image_url}
                      alt={ticket.event?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-dark-bg/80 sm:to-dark-bg/95" />
                  </div>

                  {/* Right Side ticket data details */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Status indicator badges */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest border border-white/10 rounded bg-white/5 text-primary-light">
                          {ticket.event?.category}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide border ${
                          isUsed
                            ? 'bg-white/5 border-white/15 text-dark-muted'
                            : 'bg-accent-emerald/10 border-accent-emerald/25 text-accent-emerald animate-pulse'
                        }`}>
                          {isUsed ? (
                            'Scanned & Used'
                          ) : (
                            <>
                              <CheckCircle className="w-2.5 h-2.5" />
                              Ready for Entry
                            </>
                          )}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 leading-snug line-clamp-1">
                        {ticket.event?.title}
                      </h3>

                      {/* Specs */}
                      <div className="flex flex-col gap-1.5 text-xs text-dark-muted font-semibold mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary-light" />
                          <span>{new Date(ticket.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {ticket.event?.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                          <span className="truncate max-w-[200px]">{ticket.event?.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Ticket Link button */}
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-center border border-white/5 bg-white/5 hover:bg-primary hover:border-primary text-white flex items-center justify-center gap-1.5 transition-all duration-200"
                    >
                      Access QR Pass
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default MyTicketsPage;
