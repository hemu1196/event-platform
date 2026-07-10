import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { CheckCircle2, Ticket, ArrowRight, LayoutDashboard, Calendar, Receipt, Printer } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center px-6 py-12 grid-bg print:bg-white print:text-black print:p-0">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent-emerald/5 blur-[90px] pointer-events-none print:hidden" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-2xl glass-panel shadow-2xl relative border border-accent-emerald/20 text-center print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Animated Checkbox Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
          className="inline-flex p-3 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald mb-6 print:text-black print:border-black print:bg-gray-100"
        >
          <CheckCircle2 className="w-12 h-12 animate-pulse" />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 print:text-black">Registration Secured!</h2>
        <p className="text-xs text-dark-muted font-medium mb-8 print:text-gray-700">Your ticket was booked successfully. See invoice receipt details below.</p>

        {/* Invoice Summary Box */}
        {ticketDetails && (
          <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01] text-left text-xs mb-6 flex flex-col gap-3 print:border-gray-300 print:text-black print:bg-gray-50">
            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted print:text-gray-500">Event Title:</span>
              <span className="text-white truncate font-extrabold max-w-[220px] print:text-black">{ticketDetails.event?.title}</span>
            </div>
            
            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted print:text-gray-500">Attendee Profile:</span>
              <span className="text-white font-extrabold print:text-black">{ticketDetails.user?.name}</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted print:text-gray-500">Tickets Booked:</span>
              <span className="text-white font-extrabold print:text-black">{ticketDetails.registration?.ticket_count} Spot(s)</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span className="text-dark-muted print:text-gray-500">Paid Grand Total:</span>
              <span className="text-accent-emerald font-extrabold text-sm print:text-black print:font-black">
                ₹{parseFloat(ticketDetails.registration?.total_price || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-semibold border-t border-white/5 pt-3 print:border-gray-200">
              <span className="text-dark-muted flex items-center gap-1 print:text-gray-500">
                <Receipt className="w-3.5 h-3.5 text-accent-cyan print:text-black" />
                Ticket Receipt:
              </span>
              <span className="text-white font-mono uppercase tracking-wider print:text-black print:font-bold">{ticketDetails.ticket_code}</span>
            </div>
          </div>
        )}

        {/* Primary Action: Download PDF / Print */}
        <button
          onClick={handlePrint}
          className="w-full py-3.5 mb-6 rounded-xl bg-accent-emerald text-slate-900 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent-emerald/20 hover:opacity-90 active:scale-98 transition-all print:hidden"
        >
          <Printer className="w-4 h-4" />
          Download PDF / Print Confirmation
        </button>

        {/* Action button routers */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
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
