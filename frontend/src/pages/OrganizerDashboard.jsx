import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Ticket, Award, Plus, Trash2, ShieldCheck, QrCode, Search, RefreshCw, XCircle, Users } from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for ticket validation scanner
  const [scanCode, setScanCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/organizer/my-events');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve organizer events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will erase all dependent bookings.')) return;
    
    try {
      const res = await api.delete(`/events/${eventId}`);
      if (res.data.success) {
        showToast('Event deleted successfully!', 'success');
        setEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete event.', 'error');
    }
  };

  const handleScanValidation = async (e) => {
    e.preventDefault();
    if (!scanCode.trim()) {
      showToast('Please provide a ticket code.', 'info');
      return;
    }

    setScanLoading(true);
    setScanResult(null);

    try {
      const res = await api.post(`/tickets/validate/${scanCode.trim()}`);
      setScanResult({
        success: res.data.success,
        alreadyUsed: res.data.alreadyUsed,
        message: res.data.message,
        attendee: res.data.attendee,
        event: res.data.event,
        scannedAt: res.data.scannedAt
      });
      if (res.data.success) {
        showToast('Student check-in approved!', 'success');
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Verification process encountered an error.';
      setScanResult({
        success: false,
        error: true,
        message: msg
      });
      showToast(msg, 'error');
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate metrics
  const totalSalesCount = events.reduce((sum, e) => sum + e.tickets_sold, 0);
  const totalRevenueGenerated = events.reduce((sum, e) => sum + (parseFloat(e.price) * e.tickets_sold), 0);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg">
      {/* Background neon glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-accent-purple/5 blur-[120px] pointer-events-none animate-pulse-glow" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div>
            <span className="inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-accent-purple/20 text-accent-purple border border-accent-purple/10 rounded-md mb-2">
              Organizer Suite
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Organizer Panel: <span className="text-gradient-neon">{user.name}</span>
            </h1>
            <p className="text-xs text-dark-muted font-semibold mt-1">Host new college activities, monitor sales, and audit student check-ins.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchOrganizerEvents}
              className="p-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-dark-muted" />
            </button>
            <Link
              to="/create-event"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-accent-purple text-white flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Events Hosted</p>
              <h3 className="text-3xl font-black text-white mt-1">{events.length}</h3>
            </div>
            <Calendar className="w-8 h-8 text-primary-light/50" />
          </div>

          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Total Spots Sold</p>
              <h3 className="text-3xl font-black text-white mt-1">{totalSalesCount}</h3>
            </div>
            <Users className="w-8 h-8 text-accent-cyan/50" />
          </div>

          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-emerald rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Total Platform Revenue</p>
              <h3 className="text-3xl font-black text-white mt-1">₹{totalRevenueGenerated.toFixed(2)}</h3>
            </div>
            <Award className="w-8 h-8 text-accent-emerald/50" />
          </div>
        </div>

        {/* MAIN BODY LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Managed Events Column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-light" />
              Your Active Directories
            </h3>

            {events.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-dark-border rounded-2xl bg-white/[0.01]">
                <p className="text-sm text-dark-muted font-bold mb-4">You haven't hosted any events yet.</p>
                <Link
                  to="/create-event"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all"
                >
                  Publish First Event
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-6 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-primary-light transition-colors line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="text-[10px] text-dark-muted font-semibold mt-1">
                          {event.tickets_sold} / {event.capacity} Tickets Booked (₹{event.price})
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all"
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 rounded-lg bg-accent-pink/10 hover:bg-accent-pink text-accent-pink hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Scan Check-In Validation Panel Column */}
          <div>
            <div className="p-6 rounded-2xl glass-panel relative shadow-xl sticky top-24 border border-accent-purple/20">
              <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                <QrCode className="w-4.5 h-4.5 text-accent-purple" />
                Admission QR Checker
              </h3>

              <form onSubmit={handleScanValidation} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-white/95 uppercase tracking-wide">Paste Ticket Code</label>
                  <input
                    type="text"
                    placeholder="TKT-GRP-XXXX-XXXX"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={scanLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-primary to-accent-purple text-white shadow-lg active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {scanLoading ? 'Processing Audit...' : 'Audit Admission Code'}
                </button>
              </form>

              {/* Dynamic Check-in Result Notification panels */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 border-t border-white/5 pt-4"
                  >
                    {scanResult.success ? (
                      <div className="p-4 rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 text-xs text-left">
                        <div className="flex items-center gap-2 text-accent-emerald font-black uppercase tracking-wider mb-2">
                          <ShieldCheck className="w-4 h-4 animate-bounce" />
                          Access Granted!
                        </div>
                        <p className="text-white font-extrabold mb-1">Attendee: {scanResult.attendee}</p>
                        <p className="text-dark-muted font-medium">Event: {scanResult.event}</p>
                      </div>
                    ) : scanResult.alreadyUsed ? (
                      <div className="p-4 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-xs text-left">
                        <div className="flex items-center gap-2 text-accent-pink font-black uppercase tracking-wider mb-2">
                          <XCircle className="w-4 h-4 animate-pulse" />
                          Duplicate Entry!
                        </div>
                        <p className="text-white font-extrabold mb-1">{scanResult.message}</p>
                        <p className="text-dark-muted font-medium mb-1">Student: {scanResult.attendee}</p>
                        <p className="text-dark-dim text-[10px]">Scanned: {new Date(scanResult.scannedAt).toLocaleTimeString()}</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-xs text-left text-accent-pink font-bold">
                        Error: {scanResult.message}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
