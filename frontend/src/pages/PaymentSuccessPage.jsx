import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { CheckCircle2, Ticket, ArrowRight, LayoutDashboard, Calendar, Receipt } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const ticketId = searchParams.get('ticket_id');
  const registrationId = searchParams.get('registration_id');

  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) {
      showToast('Missing transaction reference.', 'error');
      navigate('/');
      return;
    }
    fetchTicketReceipt();
  }, [ticketId]);

  const fetchTicketReceipt = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      if (res.data.success) {
        setTicketDetails(res.data.ticket);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading receipt data.', 'error');
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

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-6 py-12 grid-bg">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent-emerald/5 blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-2xl glass-panel shadow-2xl relative border border-accent-emerald/20 text-center"
      >
        {/* Animated Checkbox Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          className="inline-flex p-3 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald mb-6"
        >
          <CheckCircle2 className="w-12 h-12 animate-pulse" />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">Registration Secured!</h2>
        <p className="text-xs text-dark-muted font-medium mb-8">Your ticket was booked successfully. See invoice receipt details below.</p>

        {/* Invoice Summary Box */}
        {ticketDetails && (
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01] text-left text-xs mb-8 flex flex-col gap-3">
            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted">Event Title:</span>
              <span className="text-white truncate font-extrabold max-w-[220px]">{ticketDetails.event?.title}</span>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted">Attendee Profile:</span>
              <span className="text-white font-extrabold">{ticketDetails.user?.name}</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted">Tickets Booked:</span>
              <span className="text-white font-extrabold">{ticketDetails.registration?.ticket_count} Spot(s)</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted">Paid Grand Total:</span>
              <span className="text-accent-emerald font-extrabold text-sm">
                ₹{parseFloat(ticketDetails.registration?.total_price || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-semibold border-t border-white/5 pt-3">
              <span className="text-dark-muted flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-accent-cyan" />
                Ticket Receipt:
              </span>
              <span className="text-white font-mono uppercase tracking-wider">{ticketDetails.ticket_code}</span>
            </div>
          </div>
        )}

        {/* Action button routers */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/dashboard"
            className="flex-grow py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-xs text-white flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-dark-muted" />
            Go to Dashboard
          </Link>
          <Link
            to={`/tickets/${ticketId}`}
            className="flex-grow py-3 rounded-xl bg-gradient-to-r from-primary to-accent-purple hover:opacity-95 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 hover:scale-[1.01]"
          >
            <Ticket className="w-4 h-4" />
            Access QR Ticket Passes
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
