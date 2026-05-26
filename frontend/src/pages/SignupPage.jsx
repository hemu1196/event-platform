import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Calendar, User, Mail, Lock, Loader2, ArrowLeft, ShieldAlert, Award } from 'lucide-react';

const SignupPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user or organizer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      
      if (res.data.success) {
        login(res.data.token, res.data.user);
        showToast('Registration successful! Welcome to EventFlow.', 'success');
        
        // Redirect to dashboards
        if (res.data.user.role === 'organizer') {
          navigate('/organizer');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex items-center justify-center px-6 py-12 grid-bg">
      {/* Background Glow */}
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
        className="w-full max-w-lg p-8 rounded-2xl glass-panel shadow-2xl relative z-10 border border-white/5"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-accent-purple text-white shadow-xl shadow-primary/10 mb-4 animate-spin-slow">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-xs text-dark-muted font-medium">Join EventFlow today and unlock campus opportunities.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-xs text-accent-pink font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Account Role Selector Cards */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide mb-1">Select Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              {/* Attendee Box */}
              <div
                onClick={() => setRole('user')}
                className={`p-4 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-2 transition-all ${
                  role === 'user'
                    ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/10'
                    : 'border-dark-border bg-white/[0.02] text-dark-muted hover:border-white/10'
                }`}
              >
                <Award className={`w-5 h-5 ${role === 'user' ? 'text-primary-light' : 'text-dark-dim'}`} />
                <div>
                  <h4 className="text-sm font-bold">Attendee</h4>
                  <p className="text-[10px] text-dark-dim mt-0.5">Browse & register</p>
                </div>
              </div>

              {/* Organizer Box */}
              <div
                onClick={() => setRole('organizer')}
                className={`p-4 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-2 transition-all ${
                  role === 'organizer'
                    ? 'border-accent-purple bg-accent-purple/10 text-white shadow-lg shadow-accent-purple/10'
                    : 'border-dark-border bg-white/[0.02] text-dark-muted hover:border-white/10'
                }`}
              >
                <ShieldAlert className={`w-5 h-5 ${role === 'organizer' ? 'text-accent-purple' : 'text-dark-dim'}`} />
                <div>
                  <h4 className="text-sm font-bold">Organizer</h4>
                  <p className="text-[10px] text-dark-dim mt-0.5">Host events & check-in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-white/95 uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-muted" />
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white glass-input transition-all"
                required
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-white glass-input transition-all"
                minLength="6"
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-dark-muted font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
