import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Calendar, PlusCircle, ArrowLeft, Loader2, DollarSign, Image, Users, MapPin } from 'lucide-react';

const CreateEventPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initializing state with reasonable pre-filled stock image and values!
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    price: '0',
    capacity: '100',
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, date, time, venue, price, capacity } = formData;

    if (!title || !description || !category || !date || !time || !venue || !capacity) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/events', {
        ...formData,
        price: parseFloat(price) || 0,
        capacity: parseInt(capacity) || 100
      });

      if (res.data.success) {
        showToast('College event published successfully!', 'success');
        navigate('/organizer');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create college event.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none animate-pulse-glow" />

      <section className="max-w-2xl mx-auto px-6 pt-12">
        {/* Back Link */}
        <Link
          to="/organizer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-muted hover:text-white transition-colors uppercase tracking-wider mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel & Return
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full p-8 rounded-2xl glass-panel border border-white/5 shadow-2xl relative"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-5 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary to-accent-purple text-white shadow-lg shadow-primary/10">
              <PlusCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Host Campus Event</h1>
              <p className="text-xs text-dark-muted font-semibold mt-0.5">Fill in the fields below to publish a college registration form.</p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-xs text-accent-pink font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Event Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. HackSprint '26 Hackathon"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                required
              />
            </div>

            {/* Category selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Event Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input bg-[#0a0a0f]"
                  required
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Sports">Sports</option>
                  <option value="Seminars">Seminars</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Ticket Capacity</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                  <input
                    type="number"
                    name="capacity"
                    placeholder="e.g. 150"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Detailed Specifications</label>
              <textarea
                name="description"
                rows="4"
                placeholder="List full descriptions, rules, timelines, prize descriptions..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input leading-relaxed"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Date Picker</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Starting Time</label>
                <input
                  type="text"
                  name="time"
                  placeholder="e.g. 10:00 AM - 5:00 PM"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                  required
                />
              </div>
            </div>

            {/* Venue location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Venue Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
                <input
                  type="text"
                  name="venue"
                  placeholder="e.g. Auditorium Hall C"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                  required
                />
              </div>
            </div>

            {/* Price & Image Cover URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Ticket Price (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                  <input
                    type="number"
                    name="price"
                    placeholder="0 for Free"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Cover Image Banner URL</label>
                <div className="relative">
                  <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                  <input
                    type="url"
                    name="image_url"
                    placeholder="Unsplash / external link"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-white glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent-purple text-white shadow-xl shadow-primary/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing Event...
                </>
              ) : (
                'Publish Campus Event'
              )}
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default CreateEventPage;
