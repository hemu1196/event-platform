import { supabase } from '../config/db.js';

export const getMyTickets = async (req, res) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:event_id (*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Fetch My Tickets Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:event_id (*),
        user:user_id (name, email),
        registration:registration_id (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    // Authorization: User who owns ticket, Organizer of event, or Admin
    const isOwner = ticket.user_id === req.user.id;
    const isOrganizer = ticket.event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this ticket.' });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Fetch Ticket Detail Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch ticket details.' });
  }
};

export const validateTicket = async (req, res) => {
  try {
    const { ticket_code } = req.params;

    if (!ticket_code) {
      return res.status(400).json({ success: false, message: 'Ticket code is required.' });
    }

    // 1. Fetch ticket and event details
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:event_id (*),
        user:user_id (name, email)
      `)
      .eq('ticket_code', ticket_code.trim())
      .maybeSingle();

    if (error) throw error;
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid ticket code. Ticket does not exist.' });
    }

    // 2. Authorization check: must be the event organizer or an admin
    const isOrg = ticket.event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOrg && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. Only the event organizer can scan/verify this ticket.' });
    }

    // 3. Status check: is it already checked-in?
    if (ticket.is_used) {
      return res.status(200).json({
        success: false,
        alreadyUsed: true,
        message: 'Access Denied! Ticket has ALREADY been scanned and used.',
        attendee: ticket.user.name,
        event: ticket.event.title,
        scannedAt: ticket.updated_at || ticket.created_at
      });
    }

    // 4. Successful check-in
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({ is_used: true })
      .eq('id', ticket.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      alreadyUsed: false,
      message: 'Access Granted! Ticket successfully validated.',
      attendee: ticket.user.name,
      event: ticket.event.title
    });
  } catch (error) {
    console.error('Validate Ticket Error:', error);
    return res.status(500).json({ success: false, message: 'Server verification process encountered an error.' });
  }
};
