import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Ticket, ShieldCheck, User, Info, ArrowLeft, Plus, Minus, Loader2, Award } from 'lucide-react';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingCount, setBookingCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Custom states for simulated demo checkout
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      showToast('Event not found.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Loads Razorpay SDK script dynamically
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    // 1. Guard: Authentication check
    if (!user) {
      showToast('Please sign in to register for events.', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    setBookingLoading(true);

    try {
      // 2. Initialize Order
      const orderRes = await api.post('/payments/order', {
        event_id: event.id,
        ticket_count: bookingCount
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to initialize booking.');
      }

      const orderData = orderRes.data;

      // 3. Handle Direct Free Registration
      if (orderData.isFree) {
        showToast('Registration completed successfully!', 'success');
        navigate(`/payments/success?ticket_id=${orderData.ticket_id}&registration_id=${orderData.registration_id}`);
        return;
      }

      // 4. Handle Simulated Demo Checkout
      if (orderData.isDemoMode) {
        setDemoOrderData(orderData);
        setShowDemoModal(true);
        setBookingLoading(false);
        return;
      }

      // 5. Handle Live Razorpay SDK checkout
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        // Fallback to simulated mode if Razorpay is blocked or offline!
        showToast('Razorpay script blocked. Launching demo checkout fallback.', 'info');
        setDemoOrderData({ ...orderData, isDemoMode: true });
        setShowDemoModal(true);
        setBookingLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EventFlow Campus Ticketing',
        description: `Booking for ${orderData.event_title}`,
        order_id: orderData.order_id,
        handler: async (response) => {
          setBookingLoading(true);
          try {
            // Verify payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registration_id: orderData.registration_id,
              isDemoMode: false
            });

            if (verifyRes.data.success) {
              showToast('Payment verified successfully!', 'success');
              navigate(`/payments/success?ticket_id=${verifyRes.data.ticket_id}&registration_id=${orderData.registration_id}`);
            } else {
              showToast('Payment verification failed.', 'error');
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            showToast('Verification server error.', 'error');
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#8b5cf6'
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled by user.', 'info');
            setBookingLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Booking process encountered an error.';
      showToast(msg, 'error');
      setBookingLoading(false);
    }
  };

  // Function to execute simulated success / failure paths!
  const executeSimulatedCheckout = async (success = true) => {
    if (!success) {
      showToast('Simulated Payment Cancelled/Failed.', 'error');
      setShowDemoModal(false);
      return;
    }

    setBookingLoading(true);
    setShowDemoModal(false);

    try {
      const verifyRes = await api.post('/payments/verify', {
        razorpay_order_id: demoOrderData.order_id,
        registration_id: demoOrderData.registration_id,
        isDemoMode: true
      });

      if (verifyRes.data.success) {
        showToast('Simulated Checkout Success!', 'success');
        navigate(`/payments/success?ticket_id=${verifyRes.data.ticket_id}&registration_id=${demoOrderData.registration_id}`);
      } else {
        showToast('Simulated verification check failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Simulation verification failed.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isFree = parseFloat(event.price) === 0;
  const isSoldOut = event.tickets_sold >= event.capacity;
  const remainingTickets = event.capacity - event.tickets_sold;

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg">
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Main Cover Banner */}
      <div className="h-[35vh] md:h-[45vh] w-full relative overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
        
        {/* Floating return link */}
        <Link
          to="/"
          className="absolute top-6 left-6 md:left-12 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-bold uppercase text-white/90 tracking-wide hover:bg-black/85 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
      </div>

      {/* Main Event Body grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-16 md:-mt-24 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Metadata */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-2xl glass-panel relative">
            <span className="px-2.5 py-1 text-[10px] uppercase font-black tracking-widest bg-primary/20 border border-primary-light/20 text-primary-light rounded-md mb-4 inline-block">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-white/5 py-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/5 text-primary-light">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">Date & Time</p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-dark-muted font-semibold">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/5 text-accent-cyan">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">Venue Location</p>
                  <p className="text-sm font-semibold text-white truncate max-w-[200px]">{event.venue}</p>
                  <p className="text-xs text-dark-muted font-semibold">Campus Arena</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <h3 className="text-lg font-bold text-white mb-3">Event Specifications</h3>
            <p className="text-sm leading-relaxed text-dark-muted font-medium mb-6 whitespace-pre-line">
              {event.description}
            </p>

            {/* Organizer Block */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-sm font-bold text-white uppercase shadow-md">
                  {event.organizer?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Hosted By</p>
                  <h4 className="text-sm font-extrabold text-white">{event.organizer?.name}</h4>
                </div>
              </div>
              <a
                href={`mailto:${event.organizer?.email}`}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-white/10 hover:border-white/20 text-white/90 hover:bg-white/5 transition-all"
              >
                Inquire Organizer
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky checkout Panel */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl glass-panel relative md:sticky md:top-24 shadow-2xl">
            {/* Right Accent Ambient Glow */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary-light/50 to-transparent" />
            
            <h3 className="text-lg font-bold text-white mb-4">Registration Gateway</h3>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">Ticket Cost</span>
              <span className="text-3xl font-black text-white">
                {isFree ? 'FREE' : `₹${event.price}`}
              </span>
            </div>

            {!isSoldOut ? (
              <div className="flex flex-col gap-5">
                {/* Quantity select increment controls */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-xs font-bold text-dark-text">Ticket Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBookingCount(Math.max(1, bookingCount - 1))}
                      disabled={bookingCount <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-90 disabled:opacity-30 transition-all border border-white/5 text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-extrabold text-white w-4 text-center">{bookingCount}</span>
                    <button
                      onClick={() => setBookingCount(Math.min(remainingTickets, bookingCount + 1))}
                      disabled={bookingCount >= remainingTickets}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-90 disabled:opacity-30 transition-all border border-white/5 text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal row */}
                <div className="flex justify-between items-center py-2.5 border-t border-white/5 text-sm font-semibold">
                  <span className="text-dark-muted">Subtotal Price</span>
                  <span className="text-white font-extrabold text-lg">
                    {isFree ? '₹0.00' : `₹${(parseFloat(event.price) * bookingCount).toFixed(2)}`}
                  </span>
                </div>

                {/* Submit Checkout action button */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm text-center flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent-purple text-white shadow-xl shadow-primary/25 hover:opacity-95 active:scale-98 transition-all disabled:opacity-40"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading Gateway...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      {isFree ? 'Confirm Free Pass' : 'Proceed to Book'}
                    </>
                  )}
                </button>

                {/* Safety Seal badges */}
                <div className="flex items-center gap-2 text-[10px] text-dark-muted justify-center mt-2 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
                  Instant QR Delivery Verified
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-accent-pink/30 rounded-xl bg-accent-pink/5">
                <p className="text-sm font-bold text-accent-pink uppercase tracking-widest mb-1">Registration Full</p>
                <p className="text-xs text-dark-muted">All available capacity spots have been fully booked.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. MOCK SIMULATED PAYMENT DIALOG MODAL */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Modal Overlay blurs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => executeSimulatedCheckout(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md p-6 rounded-2xl glass-panel relative z-10 border border-primary/20 text-center shadow-glow"
            >
              <div className="inline-flex p-3 rounded-full bg-primary/10 border border-primary/25 text-primary-light mb-4 animate-pulse">
                <Ticket className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-white mb-2">Simulated Razorpay Gateway</h3>
              <p className="text-xs text-dark-muted max-w-sm mx-auto mb-6 leading-relaxed">
                This transaction is executing in **Sandbox Demonstration Mode**. You do not need real credit cards. Click a checkout action below to finalize your booking logs.
              </p>

              {/* Order Specs */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-left text-xs mb-6 flex flex-col gap-2">
                <div className="flex justify-between font-bold">
                  <span className="text-dark-muted">College Event:</span>
                  <span className="text-white truncate max-w-[200px]">{demoOrderData?.event_title}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-dark-muted">Receipt ID:</span>
                  <span className="text-white uppercase font-mono">{demoOrderData?.order_id.slice(-12)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/5 pt-2 text-sm">
                  <span className="text-dark-muted">Grand Total:</span>
                  <span className="text-primary-light font-extrabold">₹{(demoOrderData?.amount / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => executeSimulatedCheckout(false)}
                  className="flex-grow py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-xs text-white transition-all"
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => executeSimulatedCheckout(true)}
                  className="flex-grow py-3 rounded-xl bg-gradient-to-r from-primary to-accent-cyan hover:opacity-90 font-bold text-xs text-white shadow-lg shadow-primary/20 transition-all animate-bounce"
                >
                  Simulate Success
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetailsPage;
