import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Ticket, Calendar, Award, User, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard metrics.', 'error');
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

  // Calculate statistics
  const activeTickets = tickets.filter(t => !t.is_used);
  const scannedTicketsCount = tickets.length - activeTickets.length;
  
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none animate-pulse-glow" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div>
            <span className="inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-primary/20 text-primary-light border border-primary-light/10 rounded-md mb-2">
              Student Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-gradient">{user.name}</span>!
            </h1>
            <p className="text-xs text-dark-muted font-semibold mt-1">Manage your active event tickets and view registrations.</p>
          </div>

          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all self-start md:self-auto"
          >
            Explore College Events
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Total Bookings</p>
              <h3 className="text-3xl font-black text-white mt-1">{tickets.length}</h3>
            </div>
            <Ticket className="w-8 h-8 text-primary-light/50" />
          </div>

          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Active Tickets</p>
              <h3 className="text-3xl font-black text-white mt-1">{activeTickets.length}</h3>
            </div>
            <Calendar className="w-8 h-8 text-accent-cyan/50" />
          </div>

          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-emerald rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Attended Events</p>
              <h3 className="text-3xl font-black text-white mt-1">{scannedTicketsCount}</h3>
            </div>
            <Award className="w-8 h-8 text-accent-emerald/50" />
          </div>
        </div>

        {/* MAIN BODY LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Active Passes Column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-light" />
              Active Admission Passes
            </h3>

            {activeTickets.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-dark-border rounded-2xl bg-white/[0.01]">
                <p className="text-sm text-dark-muted font-bold">No upcoming events on your schedule.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-6 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={ticket.event?.image_url}
                          alt={ticket.event?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-primary-light transition-colors line-clamp-1">
                          {ticket.event?.title}
                        </h4>
                        <p className="text-xs text-dark-muted mt-0.5">
                          {new Date(ticket.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {ticket.event?.time}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-primary hover:border-primary text-white border border-white/5 transition-all flex-shrink-0"
                    >
                      Open Pass
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Panel Column */}
          <div>
            <div className="p-6 rounded-2xl glass-panel relative shadow-xl">
              <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                <User className="w-4.5 h-4.5 text-accent-cyan" />
                Attendee Credentials
              </h3>

              <div className="flex flex-col gap-4 text-xs font-semibold leading-relaxed">
                <div>
                  <p className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Account ID</p>
                  <p className="text-white font-mono uppercase mt-0.5">{user.id.slice(0, 15)}...</p>
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Registrant Email</p>
                  <p className="text-white mt-0.5">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Authorization Role</p>
                  <span className="inline-block mt-1 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary-light text-[9px]">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
