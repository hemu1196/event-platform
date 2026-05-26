import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, LogOut, Menu, X, LayoutDashboard, Ticket, PlusCircle, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    showToast('Logged out successfully!', 'success');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  const navLinks = [
    { label: 'Browse Events', path: '/' },
    { label: 'My Tickets', path: '/my-tickets', protected: true, role: 'user' },
    { label: 'Create Event', path: '/create-event', protected: true, role: 'organizer' },
  ];

  const activeLinkClass = "text-primary-light font-medium";
  const inactiveLinkClass = "text-dark-muted hover:text-white transition-colors duration-200";

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-dark-border py-4 px-6 md:px-12 flex items-center justify-between">
      {/* Platform Branding */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent-purple text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          Event<span className="text-primary-light">Flow</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          // If link is protected and user role doesn't match, skip
          if (link.protected && (!user || (link.role && user.role !== link.role))) return null;
          
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={isActive ? activeLinkClass : inactiveLinkClass}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Desktop User Panel */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dark-border hover:border-primary-light/35 bg-white/5 transition-all duration-300 text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-xs font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="max-w-[120px] truncate font-medium text-white/90">{user.name}</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-52 p-1.5 rounded-xl border border-dark-border glass-panel-light shadow-2xl z-20"
                  >
                    {/* User Info Details */}
                    <div className="px-3 py-2.5 mb-1.5 border-b border-white/5">
                      <p className="text-xs text-dark-muted font-normal">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary-light">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-dark-text hover:bg-white/5 hover:text-white transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary-light" />
                      Dashboard
                    </Link>

                    {user.role === 'user' && (
                      <Link
                        to="/my-tickets"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-dark-text hover:bg-white/5 hover:text-white transition-all"
                      >
                        <Ticket className="w-4 h-4 text-accent-cyan" />
                        My Tickets
                      </Link>
                    )}

                    {user.role === 'organizer' && (
                      <Link
                        to="/create-event"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-dark-text hover:bg-white/5 hover:text-white transition-all"
                      >
                        <PlusCircle className="w-4 h-4 text-accent-purple" />
                        Create Event
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 mt-1 rounded-lg text-sm text-accent-pink hover:bg-accent-pink/10 transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-dark-muted hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-dark text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transform active:scale-95 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center gap-3">
        {user && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center text-xs font-bold text-white uppercase">
            {user.name.charAt(0)}
          </div>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-lg text-dark-muted hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="absolute top-[73px] left-0 right-0 w-full glass-panel border-b border-dark-border z-40 px-6 py-6 md:hidden flex flex-col gap-4 overflow-hidden"
          >
            {navLinks.map((link) => {
              if (link.protected && (!user || (link.role && user.role !== link.role))) return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold py-1.5 border-b border-white/5 text-dark-text hover:text-white"
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-semibold py-1.5 text-primary-light"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-base font-semibold py-1.5 text-accent-pink mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2.5 rounded-lg border border-dark-border text-base font-semibold text-white/95"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2.5 rounded-lg bg-primary text-base font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
