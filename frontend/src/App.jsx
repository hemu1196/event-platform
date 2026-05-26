import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Contexts
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import MyTicketsPage from './pages/MyTicketsPage';
import QRTicketPage from './pages/QRTicketPage';
import UserDashboard from './pages/UserDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-dark-bg text-dark-text overflow-hidden">
            {/* Sticky Global Navigation */}
            <Navbar />
            
            {/* Page Router Viewports */}
            <main className="flex-grow">
              <Routes>
                {/* 1. PUBLIC ROUTINGS */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />

                {/* 2. PROTECTED STUDENT ROUTINGS */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['user']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <MyTicketsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 3. PROTECTED TRANSACTION SUCCESSES */}
                <Route
                  path="/payments/success"
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <PaymentSuccessPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. PROTECTED QR PASS ROUTINGS */}
                <Route
                  path="/tickets/:id"
                  element={
                    <ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}>
                      <QRTicketPage />
                    </ProtectedRoute>
                  }
                />

                {/* 5. PROTECTED CAMPUS ORGANIZERS */}
                <Route
                  path="/organizer"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />

                {/* 6. PROTECTED ADMINISTRATOR ROUTINGS */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 7. FALLBACK REDIRECTS */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
