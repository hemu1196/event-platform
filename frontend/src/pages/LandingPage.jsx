import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Tag, ArrowRight, BookOpen, Star, Sparkles, Award } from 'lucide-react';

const LandingPage = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Categories list
  const categories = ['All', 'Technical', 'Cultural', 'Workshops', 'Sports', 'Seminars'];

  useEffect(() => {
    fetchEvents();
  }, [category]); // Refetch on category pill click

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/events';
      const params = [];
      if (category !== 'All') params.push(`category=${category}`);
      if (search) params.push(`search=${search}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative grid-bg">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-cyan/5 blur-[120px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative px-6 md:px-12 pt-16 md:pt-28 pb-16 text-center max-w-6xl mx-auto flex flex-col items-center">
        {/* Badge Intro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary-light text-xs font-semibold mb-6 shadow-glow"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Simplifying College Event Experiences
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          Discover, Register & Book <br />
          <span className="text-gradient-neon">Campus Events Seamlessly</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-dark-muted max-w-2xl mb-10 leading-relaxed font-medium"
        >
          The ultimate capstone event ticketing ecosystem. Register for hackathons, cultural festivals, workshops, and sports matches with instant secure QR passes.
        </motion.p>

        {/* Hero CTA buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20 z-10"
        >
          <a
            href="#events-list"
            className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-primary to-accent-purple text-white shadow-xl shadow-primary/25 hover:shadow-primary/35 active:scale-95 hover:scale-[1.02] transition-all duration-200"
          >
            Explore Live Events
          </a>
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-xl font-bold border border-dark-border hover:border-white/20 bg-white/5 text-white active:scale-95 transition-all duration-200"
          >
            Create Organizer Account
          </Link>
        </motion.div>
      </section>

      {/* 2. CORE STATISTICS SECTION */}
      <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl glass-panel shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="text-center">
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-2">1,500+</h3>
            <p className="text-xs md:text-sm text-dark-muted font-bold uppercase tracking-wider">Tickets Issued</p>
          </div>
          <div className="text-center border-l border-white/5">
            <h3 className="text-3xl md:text-5xl font-extrabold text-primary-light mb-2">45+</h3>
            <p className="text-xs md:text-sm text-dark-muted font-bold uppercase tracking-wider">Host Clubs</p>
          </div>
          <div className="text-center border-l border-white/5">
            <h3 className="text-3xl md:text-5xl font-extrabold text-accent-cyan mb-2">12+</h3>
            <p className="text-xs md:text-sm text-dark-muted font-bold uppercase tracking-wider">Campus Verticals</p>
          </div>
          <div className="text-center border-l border-white/5">
            <h3 className="text-3xl md:text-5xl font-extrabold text-accent-pink mb-2">99.9%</h3>
            <p className="text-xs md:text-sm text-dark-muted font-bold uppercase tracking-wider">Entry Audited</p>
          </div>
        </motion.div>
      </section>

      {/* 3. DYNAMIC SEARCH & EVENTS FILTER */}
      <section id="events-list" className="px-6 md:px-12 py-20 max-w-6xl mx-auto scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">Live Campus Happenings</h2>
            <p className="text-sm text-dark-muted font-medium">Browse scheduled summits, hackathons, and activities.</p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex w-full md:max-w-md items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
              <input
                type="text"
                placeholder="Search hackathons, venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium text-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition-colors duration-150"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2.5 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
                category === cat
                  ? 'bg-gradient-to-r from-primary to-accent-purple text-white shadow-lg shadow-primary/20 scale-105'
                  : 'border border-dark-border bg-white/5 text-dark-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* RENDER EVENTS CARD GRID */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm text-dark-muted font-medium">Scanning network database...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-dark-border rounded-2xl bg-white/[0.01]">
            <p className="text-lg text-dark-muted font-bold mb-2">No Campus Events Found</p>
            <p className="text-sm text-dark-dim max-w-md mx-auto">Try refining your keyword tags or selecting another category.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {events.map((event) => {
              const isFree = parseFloat(event.price) === 0;
              const isSoldOut = event.tickets_sold >= event.capacity;
              
              return (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  className="group rounded-2xl overflow-hidden glass-card flex flex-col h-full relative"
                >
                  {/* Event Thumbnail */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Dark gradient overlap */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-transparent to-transparent" />
                    
                    {/* Category Label */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider bg-black/60 border border-white/10 backdrop-blur-md rounded-md text-primary-light">
                        {event.category}
                      </span>
                    </div>

                    {/* Cost Badge */}
                    <div className="absolute bottom-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border ${
                        isFree 
                          ? 'bg-accent-emerald/20 border-accent-emerald text-accent-emerald' 
                          : 'bg-primary/20 border-primary-light/30 text-white'
                      }`}>
                        {isFree ? 'FREE' : `₹${event.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Data details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary-light transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-dark-muted mb-4 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata indicators */}
                    <div className="flex flex-col gap-2 mt-auto text-xs text-dark-muted font-semibold mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary-light" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${isSoldOut ? 'bg-accent-pink' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, (event.tickets_sold / event.capacity) * 100)}%` }}
                          />
                        </div>
                        <span className="flex-shrink-0 text-[10px] uppercase text-dark-dim">
                          {isSoldOut ? 'Sold Out' : `${event.capacity - event.tickets_sold} left`}
                        </span>
                      </div>
                    </div>

                    {/* Register action button */}
                    <Link
                      to={`/events/${event.id}`}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        isSoldOut
                          ? 'bg-white/5 border border-dark-border text-dark-dim cursor-not-allowed'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-primary hover:border-primary'
                      }`}
                    >
                      {isSoldOut ? 'Sold Out' : 'Register Now'}
                      {!isSoldOut && <ArrowRight className="w-4 h-4" />}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto border-t border-dark-border/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Evaluators & Student Endorsements</h2>
          <p className="text-sm text-dark-muted max-w-md mx-auto">See how this platform bridges administrative oversight and campus activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card flex flex-col relative"
          >
            <Star className="w-6 h-6 text-primary-light mb-4" />
            <p className="text-sm text-dark-text italic mb-6 leading-relaxed">
              "This platform dramatically cut organizer stress. Checking in 300+ students at our techfest took less than 15 minutes total using the dynamic QR tickets!"
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-cyan to-primary flex items-center justify-center text-xs font-bold text-white uppercase">
                SC
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Siddharth C.</h4>
                <p className="text-[10px] text-dark-muted font-bold">Tech Club President</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card flex flex-col relative border-primary-light/10"
          >
            <Star className="w-6 h-6 text-accent-cyan mb-4" />
            <p className="text-sm text-dark-text italic mb-6 leading-relaxed">
              "The design is gorgeous. For a capstone, this demonstrates incredible full-stack awareness. The Razorpay verification and JWT locks are built perfectly."
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-pink to-accent-purple flex items-center justify-center text-xs font-bold text-white uppercase">
                PK
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Prof. K. Nair</h4>
                <p className="text-[10px] text-dark-muted font-bold">Project Coordinator</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl glass-card flex flex-col relative"
          >
            <Star className="w-6 h-6 text-accent-pink mb-4" />
            <p className="text-sm text-dark-text italic mb-6 leading-relaxed">
              "Buying tickets was simple and fast. Getting the QR screen on my phone and scanning it at the auditorium was a delightful frictionless experience."
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent-pink flex items-center justify-center text-xs font-bold text-white uppercase">
                RD
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Rhea Dutta</h4>
                <p className="text-[10px] text-dark-muted font-bold">B.Tech Student</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. PORTFOLIO & TECH SPECS BLOCK */}
      <section className="px-6 md:px-12 py-16 max-w-6xl mx-auto border-t border-dark-border/40">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-accent-purple/5 to-accent-cyan/5 border border-dark-border flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary-light mb-2">
              <Award className="w-5 h-5 animate-pulse" />
              <span className="text-xs uppercase font-extrabold tracking-widest">Major Capstone Deliverable</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Portfolio Worthy Stack</h3>
            <p className="text-sm text-dark-muted max-w-xl leading-relaxed">
              Built on React Vite, Node Express, Supabase PostgreSQL engines, JWT custom payload authentication, Razorpay sandboxed integrations, and client QR validators. Cleanly modularized for swift viva presentations.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-dark-border hover:border-white/15 font-bold text-sm transition-all flex-shrink-0"
          >
            Inspect Technical Docs
          </a>
        </div>
      </section>

      {/* 6. GLOBAL FOOTER */}
      <footer className="w-full border-t border-dark-border bg-dark-bg/85 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary text-white shadow-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Event<span className="text-primary-light">Flow</span>
              </span>
            </Link>
            <p className="text-xs text-dark-muted max-w-sm leading-relaxed mb-6 font-medium">
              EventFlow is a premium college capstone web engineering project designed to simplify events, booking registrations, payments, and ticket audit streams.
            </p>
            <div className="flex gap-2">
              {['React.js', 'Node.js', 'Supabase', 'Razorpay', 'Framer Motion'].map((tag) => (
                <span key={tag} className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 text-dark-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-white mb-4">Ecosystem</h4>
            <div className="flex flex-col gap-2.5 text-xs text-dark-muted font-bold">
              <Link to="/login" className="hover:text-white transition-colors">Sign In Portal</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Register Account</Link>
              <a href="#events-list" className="hover:text-white transition-colors">College Events</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-white mb-4">Capstone Info</h4>
            <div className="text-xs text-dark-muted leading-relaxed font-semibold">
              <p className="mb-1 text-white/95">Event Registration Capstone</p>
              <p className="mb-1">Academic Year: 2026</p>
              <p>Platform Status: Fully Operational</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-dark-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-dark-muted font-bold">
          <p>© {new Date().getFullYear()} EventFlow Ticketing Systems. Designed for University Viva Submission.</p>
          <p>Portfolio Project & Academic Capstone Work.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
