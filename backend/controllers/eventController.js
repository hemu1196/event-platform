import { supabase } from '../config/db.js';

export const getAllEvents = async (req, res) => {
  try {
    const { search, category } = req.query;

    let dbQuery = supabase.from('events').select('*');

    if (category && category !== 'All') {
      dbQuery = dbQuery.eq('category', category);
    }

    if (search) {
      dbQuery = dbQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue.ilike.%${search}%`);
    }

    // Order by upcoming date
    dbQuery = dbQuery.order('date', { ascending: true });

    const { data: events, error } = await dbQuery;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Fetch Events Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Fetch organizer details
    const { data: organizer, error: orgError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', event.organizer_id)
      .single();

    const organizerDetails = orgError ? { name: 'Unknown Organizer', email: '' } : organizer;

    return res.status(200).json({
      success: true,
      event: {
        ...event,
        organizer: organizerDetails
      }
    });
  } catch (error) {
    console.error('Fetch Event Details Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch event details.' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, price, capacity, image_url } = req.body;

    if (!title || !description || !category || !date || !time || !venue || capacity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description,
          category,
          date,
          time,
          venue,
          price: parseFloat(price) || 0,
          capacity: parseInt(capacity),
          tickets_sold: 0,
          image_url: image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200',
          organizer_id: req.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event: newEvent
    });
  } catch (error) {
    console.error('Create Event Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, date, time, venue, price, capacity, image_url } = req.body;

    // Check if event exists
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Verify ownership (or admin status)
    if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this event.' });
    }

    const updatedData = {
      title: title || event.title,
      description: description || event.description,
      category: category || event.category,
      date: date || event.date,
      time: time || event.time,
      venue: venue || event.venue,
      price: price !== undefined ? parseFloat(price) : event.price,
      capacity: capacity !== undefined ? parseInt(capacity) : event.capacity,
      image_url: image_url || event.image_url
    };

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update Event Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Verify ownership (or admin status)
    if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this event.' });
    }

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully!'
    });
  } catch (error) {
    console.error('Delete Event Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};

export const getOrganizerEvents = async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Fetch Organizer Events Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your events.' });
  }
};
