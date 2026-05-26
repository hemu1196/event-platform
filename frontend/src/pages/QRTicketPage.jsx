import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Printer, ArrowLeft, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

const QRTicketPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      if (res.data.success) {
        setTicket(res.data.ticket);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading ticket pass.', 'error');
      navigate('/my-tickets');
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

  if (!ticket) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center px-6">
        <AlertCircle className="w-12 h-12 text-accent-pink mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Ticket Not Found</h3>
        <Link to="/my-tickets" className="text-primary-light hover:underline text-sm font-semibold">Return to my list</Link>
      </div>
    );
  }

  const isUsed = ticket.is_used;

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg print:bg-white print:text-black">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[90px] pointer-events-none print:hidden" />

      <div className="max-w-md mx-auto px-6 pt-12 print:pt-0">
        {/* Back Link */}
        <Link
          to="/my-tickets"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-muted hover:text-white transition-colors uppercase tracking-wider mb-6 print:hidden"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My Tickets
        </Link>

        {/* PRINTABLE DIGITAL TICKET STUB */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-3xl relative overflow-hidden bg-gradient-to-b from-[#11121c] to-[#08080f] border border-white/5 shadow-2xl flex flex-col print:border-black print:bg-white print:text-black print:shadow-none print:static"
        >
          {/* Cover Card Art Header */}
          <div className="h-36 relative overflow-hidden flex-shrink-0 print:hidden">
            <img
              src={ticket.event?.image_url}
              alt={ticket.event?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11121c] to-[#11121c]/40" />
            
            <div className="absolute bottom-4 left-6">
              <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary border border-primary-light/20 text-white rounded">
                {ticket.event?.category}
              </span>
            </div>
          </div>

          {/* Core Ticket Information Stub details */}
          <div className="p-6 pb-4">
            <span className="text-[10px] text-dark-muted font-bold uppercase tracking-wider block mb-1.5 print:text-gray-500">College Admission Pass</span>
            <h2 className="text-xl font-extrabold text-white leading-snug mb-4 line-clamp-2 print:text-black print:font-black">
              {ticket.event?.title}
            </h2>

            {/* Spec lines */}
            <div className="flex flex-col gap-3 text-xs text-dark-muted font-semibold mb-2 print:text-black print:font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-light print:text-black" />
                <span>{new Date(ticket.event?.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {ticket.event?.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-cyan print:text-black" />
                <span>{ticket.event?.venue} (Campus Arena)</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-accent-purple print:text-black" />
                <span>Slot Quantity: {ticket.registration?.ticket_count} Attendee(s)</span>
              </div>
            </div>
          </div>

          {/* GORGEOUS ROUNDED NOTCH CUT-OUTS AND DASHED TEAR LINE */}
          <div className="relative h-6 flex items-center justify-between print:static">
            {/* Left Notch */}
            <div className="w-6 h-6 rounded-full bg-dark-bg absolute -left-3 border-r border-white/5 print:hidden" />
            
            {/* Dashed Line */}
            <div className="w-full border-t border-dashed border-white/10 mx-5 print:border-black" />
            
            {/* Right Notch */}
            <div className="w-6 h-6 rounded-full bg-dark-bg absolute -right-3 border-l border-white/5 print:hidden" />
          </div>

          {/* BARCODE STUB PANEL */}
          <div className="p-6 pt-4 flex flex-col items-center text-center">
            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white border border-white/5 shadow-inner relative overflow-hidden flex items-center justify-center w-48 h-48 mb-4">
              {/* Dynamic QR SVG */}
              <QRCodeSVG
                value={ticket.ticket_code}
                size={160}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
              
              {/* Used Watermark Overlay */}
              {isUsed && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-2 animate-fade-in">
                  <div className="px-3 py-1 bg-accent-pink/15 border border-accent-pink/35 text-accent-pink text-[10px] font-black uppercase tracking-widest rounded-md rotate-[-12deg]">
                    Voided / Used
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Code Tag */}
            <p className="text-[10px] font-mono text-dark-muted uppercase tracking-widest mb-4 print:text-black">
              Passcode: <span className="text-white font-extrabold print:text-black">{ticket.ticket_code}</span>
            </p>

            {/* Student metadata */}
            <div className="w-full text-left p-3 rounded-xl border border-white/5 bg-white/[0.01] text-[11px] mb-4 print:border-black print:text-black print:font-medium">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-dark-muted print:text-gray-500">Student Attendee:</span>
                <span className="text-white print:text-black">{ticket.user?.name}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-dark-muted print:text-gray-500">Registered Email:</span>
                <span className="text-white truncate print:text-black">{ticket.user?.email}</span>
              </div>
            </div>

            {/* Ready indicator status banner */}
            <div className={`w-full py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 ${
              isUsed
                ? 'bg-white/5 border-white/10 text-dark-muted'
                : 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald animate-pulse-glow'
            }`}>
              {isUsed ? (
                <>
                  <Clock className="w-4 h-4" />
                  Scanned & Verified
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                  Valid Entry Pass
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Offline utility print buttons */}
        <button
          onClick={handlePrint}
          className="w-full py-3.5 mt-6 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 print:hidden"
        >
          <Printer className="w-4 h-4 text-dark-muted" />
          Print Pass / Download PDF
        </button>
      </div>
    </div>
  );
};

export default QRTicketPage;
