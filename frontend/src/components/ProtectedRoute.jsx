import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated Background Aura Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[80px] animate-pulse-glow" />
        
        {/* Spinner Logo Container */}
        <div className="relative flex flex-col items-center">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary to-accent-cyan text-white shadow-2xl relative z-10 animate-bounce">
            <Calendar className="w-8 h-8" />
          </div>
          
          {/* Pulsing ring animation */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-accent-cyan blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <p className="text-sm font-semibold tracking-wider text-white/90 uppercase">Restoring Session</p>
            </div>
            <p className="text-xs text-dark-muted mt-1 font-medium">Verifying credentials safely...</p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if user role is authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not matching, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
