import { supabase } from '../config/db.js';

export const getPlatformAnalytics = async (req, res) => {
  try {
    // 1. Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // 2. Get total events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (eventsError) throw eventsError;

    // 3. Get total revenue (Sum of total_price in completed registrations)
    const { data: completedBookings, error: revenueError } = await supabase
      .from('registrations')
      .select('total_price')
      .eq('payment_status', 'completed');

    if (revenueError) throw revenueError;

    const totalRevenue = completedBookings.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

    // 4. Get recent registrations (limit to 5, sorted by latest)
    const { data: recentRegs, error: recentError } = await supabase
      .from('registrations')
      .select(`
        id,
        ticket_count,
        total_price,
        created_at,
        event:event_id (title),
        user:user_id (name, email)
      `)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalRevenue: totalRevenue || 0,
        recentRegistrations: recentRegs || []
      }
    });
  } catch (error) {
    console.error('Fetch Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to aggregate platform analytics.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Self-deletion is forbidden. You cannot delete your own admin account.' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'User account and all their records successfully deleted.'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};
