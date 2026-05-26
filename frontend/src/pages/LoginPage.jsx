import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Calendar, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user came from a protected route
  const from = location.state?.from?.pathname || '/';

  // Check if session expired trigger was set
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        login(res.data.token, res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        
        // Redirect to their respective dashboards based on role
        if (from === '/') {
          if (res.data.user.role === 'admin') navigate('/admin');
          else if (res.data.user.role === 'organizer') navigate('/organizer');
          else navigate('/dashboard');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex items-center justify-center px-6 py-12 grid-bg">
      {/* Background Aura Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[90px] pointer-events-none animate-pulse-glow" />

      {/* Back button */}
      <Link
        to="/"
        className="absolute top-8 left-6 md:left-12 flex items-center gap-1.5 text-xs font-bold text-dark-muted hover:text-white transition-colors uppercase tracking-wider group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Return Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl relative z-10 border border-white/5"
      >
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-accent-cyan text-white shadow-xl shadow-primary/10 mb-4 animate-spin-slow">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-xs text-dark-muted font-medium">Enter your credentials to manage your tickets.</p>
        </div>

        {/* Dynamic Alerts */}
        {sessionExpired && (
          <div className="p-3 mb-6 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary-light font-bold text-center animate-pulse">
            Your login session has expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="p-3 mb-6 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-xs text-accent-pink font-semibold text-center">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white glass-input transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white glass-input transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent-purple text-white hover:opacity-95 shadow-lg shadow-primary/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Navigation Signup Redirect */}
        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-dark-muted font-bold">
            New to EventFlow?{' '}
            <Link to="/signup" className="text-primary-light hover:underline ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
