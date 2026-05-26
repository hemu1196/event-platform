import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, Calendar, Award, RefreshCw, Trash2, LayoutGrid, Clock, ListFilter } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics or users

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Platform Analytics
      const analyticsRes = await api.get('/admin/analytics');
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }

      // 2. Fetch Users Directory
      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve administrative records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showToast('Self-deletion is forbidden. You cannot delete your own admin account.', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user? All their events, tickets, and transactions will be erased.')) return;

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('User account successfully deleted!', 'success');
        setUsersList(prev => prev.filter(u => u.id !== userId));
        // Refresh analytics numbers
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user account.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text pb-20 relative grid-bg">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-accent-pink/5 blur-[120px] pointer-events-none animate-pulse-glow" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div>
            <span className="inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-accent-pink/20 text-accent-pink border border-accent-pink/10 rounded-md mb-2">
              System Admin
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Ecosystem Control: <span className="text-gradient-neon">{user.name}</span>
            </h1>
            <p className="text-xs text-dark-muted font-semibold mt-1">Platform-wide statistics monitoring, moderation, and account directories.</p>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Records
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-pink rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Platform Users</p>
              <h3 className="text-3xl font-black text-white mt-1">{analytics?.totalUsers}</h3>
            </div>
            <Users className="w-8 h-8 text-accent-pink/50" />
          </div>

          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Active Events</p>
              <h3 className="text-3xl font-black text-white mt-1">{analytics?.totalEvents}</h3>
            </div>
            <Calendar className="w-8 h-8 text-accent-cyan/50" />
          </div>

          <div className="p-5 rounded-2xl glass-panel relative flex items-center justify-between shadow-lg">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-emerald rounded-l-2xl" />
            <div>
              <p className="text-[10px] text-dark-muted font-extrabold uppercase tracking-widest">Cumulative Revenue</p>
              <h3 className="text-3xl font-black text-white mt-1">₹{analytics?.totalRevenue.toFixed(2)}</h3>
            </div>
            <Award className="w-8 h-8 text-accent-emerald/50" />
          </div>
        </div>

        {/* TAB PANELS */}
        <div className="flex border-b border-white/5 mb-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 text-sm font-extrabold tracking-wide border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-accent-pink text-white'
                : 'border-transparent text-dark-muted hover:text-white'
            }`}
          >
            System Registry
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 text-sm font-extrabold tracking-wide border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-accent-pink text-white'
                : 'border-transparent text-dark-muted hover:text-white'
            }`}
          >
            User Account Moderation
          </button>
        </div>

        {/* RENDER ACTIVE TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-pink" />
                Recent Transaction History
              </h3>

              {analytics?.recentRegistrations.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-dark-border rounded-2xl bg-white/[0.01]">
                  <p className="text-sm text-dark-muted font-bold">No tickets issued on the platform yet.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 overflow-hidden bg-white/[0.01]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-dark-muted font-extrabold uppercase tracking-widest text-[9px]">
                        <th className="p-4">Attendee Details</th>
                        <th className="p-4">College Event</th>
                        <th className="p-4">Ticket count</th>
                        <th className="p-4">Revenue</th>
                        <th className="p-4">Transaction Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                      {analytics?.recentRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4">
                            <p className="font-extrabold text-white">{reg.user?.name}</p>
                            <p className="text-[10px] text-dark-muted font-medium">{reg.user?.email}</p>
                          </td>
                          <td className="p-4 truncate max-w-[180px]">{reg.event?.title}</td>
                          <td className="p-4 text-center">{reg.ticket_count}</td>
                          <td className="p-4 text-accent-emerald">₹{parseFloat(reg.total_price).toFixed(2)}</td>
                          <td className="p-4 text-dark-muted font-medium">
                            {new Date(reg.created_at).toLocaleDateString()} at {new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-pink" />
                Ecosystem Directory Registry
              </h3>

              <div className="rounded-xl border border-white/5 overflow-hidden bg-white/[0.01]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-dark-muted font-extrabold uppercase tracking-widest text-[9px]">
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Registry Role</th>
                      <th className="p-4">Creation Date</th>
                      <th className="p-4 text-right">Moderator Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 font-extrabold text-white">{usr.name}</td>
                        <td className="p-4">{usr.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                            usr.role === 'admin' ? 'bg-accent-pink/15 text-accent-pink' :
                            usr.role === 'organizer' ? 'bg-accent-purple/15 text-accent-purple' :
                            'bg-primary/15 text-primary-light'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-4 text-dark-muted font-medium">{new Date(usr.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            disabled={usr.id === user.id}
                            className={`p-2 rounded-lg transition-all ${
                              usr.id === user.id
                                ? 'bg-white/5 text-dark-dim cursor-not-allowed'
                                : 'bg-accent-pink/10 hover:bg-accent-pink text-accent-pink hover:text-white active:scale-90'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
