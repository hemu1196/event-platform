import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { supabase } from '../config/db.js';

dotenv.config();

// Initialize Razorpay only if keys are present (prevent server crash on missing envs)
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.log('WARNING: Razorpay API keys are missing. Paid events checkout will run in simulated demo mode.');
}

export const createOrder = async (req, res) => {
  try {
    const { event_id, ticket_count } = req.body;
    const count = parseInt(ticket_count) || 1;

    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    // 1. Fetch Event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .maybeSingle();

    if (eventError || !event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // 2. Check Capacity
    if (event.tickets_sold + count > event.capacity) {
      return res.status(400).json({
        success: false,
        message: `Not enough tickets available. Only ${event.capacity - event.tickets_sold} remaining.`
      });
    }

    const totalPrice = parseFloat(event.price) * count;

    // 3. Create Pending Registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([
        {
          event_id,
          user_id: req.user.id,
          ticket_count: count,
          total_price: totalPrice,
          payment_status: 'pending'
        }
      ])
      .select()
      .single();

    if (regError) throw regError;

    // 4. Handle Free Event (Price is 0)
    if (totalPrice === 0) {
      // Direct completion for Free Event
      await supabase
        .from('registrations')
        .update({ payment_status: 'completed' })
        .eq('id', registration.id);

      // Increment tickets sold
      await supabase
        .from('events')
        .update({ tickets_sold: event.tickets_sold + count })
        .eq('id', event_id);

      // Generate Ticket
      const ticketCode = `TKT-FREE-${registration.id.split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([
          {
            registration_id: registration.id,
            user_id: req.user.id,
            event_id,
            ticket_code: ticketCode,
            is_used: false
          }
        ])
        .select()
        .single();

      if (ticketError) throw ticketError;

      return res.status(201).json({
        success: true,
        isFree: true,
        message: 'Registration completed successfully for free event!',
        registration_id: registration.id,
        ticket_id: ticket.id
      });
    }

    // 5. Paid Event: Setup Razorpay Order
    // Fallback: If Razorpay keys aren't set, return simulated demo details
    if (!razorpayInstance) {
      // Simulate Razorpay checkout parameters for ease of testing without API keys!
      const mockOrderId = `order_mock_${registration.id.split('-')[0]}_${Date.now()}`;
      
      await supabase
        .from('payments')
        .insert([
          {
            registration_id: registration.id,
            razorpay_order_id: mockOrderId,
            amount: totalPrice,
            status: 'pending'
          }
        ]);

      return res.status(200).json({
        success: true,
        isFree: false,
        isDemoMode: true,
        key: 'rzp_test_demo12345',
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        order_id: mockOrderId,
        registration_id: registration.id,
        event_title: event.title
      });
    }

    // Official Razorpay Flow
    const options = {
      amount: Math.round(totalPrice * 100), // Razorpay accepts in paise
      currency: 'INR',
      receipt: registration.id
    };

    const rzpOrder = await razorpayInstance.orders.create(options);

    // Save Payment Entry
    await supabase
      .from('payments')
      .insert([
        {
          registration_id: registration.id,
          razorpay_order_id: rzpOrder.id,
          amount: totalPrice,
          status: 'pending'
        }
      ]);

    return res.status(200).json({
      success: true,
      isFree: false,
      isDemoMode: false,
      key: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      order_id: rzpOrder.id,
      registration_id: registration.id,
      event_title: event.title
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ success: false, message: 'Payment initialization failed.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registration_id,
      isDemoMode
    } = req.body;

    if (!registration_id || !razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Invalid payment verification fields.' });
    }

    // 1. Fetch pending registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      return res.status(404).json({ success: false, message: 'Registration session not found.' });
    }

    // 2. Fetch event details to get current tickets sold
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', registration.event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    let isSignatureValid = false;

    if (isDemoMode) {
      // Simulate verification for demo mode
      isSignatureValid = true;
    } else if (razorpayInstance) {
      // Crypto signature hashing validation
      const text = razorpay_order_id + "|" + razorpay_payment_id;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      isSignatureValid = generated_signature === razorpay_signature;
    }

    if (!isSignatureValid) {
      // Failed Verification
      await supabase
        .from('registrations')
        .update({ payment_status: 'failed' })
        .eq('id', registration_id);

      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // 3. SUCCESSFUL PAYMENT
    // Update registration status
    await supabase
      .from('registrations')
      .update({ payment_status: 'completed' })
      .eq('id', registration_id);

    // Update or Insert completed Payment Log
    const { data: currentPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (currentPayment) {
      await supabase
        .from('payments')
        .update({
          razorpay_payment_id: razorpay_payment_id || `pay_demo_${Date.now()}`,
          razorpay_signature: razorpay_signature || `sig_demo_${Date.now()}`,
          status: 'completed'
        })
        .eq('razorpay_order_id', razorpay_order_id);
    } else {
      await supabase
        .from('payments')
        .insert([
          {
            registration_id,
            razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id || `pay_demo_${Date.now()}`,
            razorpay_signature: razorpay_signature || `sig_demo_${Date.now()}`,
            amount: registration.total_price,
            status: 'completed'
          }
        ]);
    }

    // 4. Increment event tickets sold count
    const newTicketsSold = event.tickets_sold + registration.ticket_count;
    await supabase
      .from('events')
      .update({ tickets_sold: newTicketsSold })
      .eq('id', event.id);

    // 5. Generate secure ticket inside Database
    const ticketCode = `TKT-${registration.ticket_count > 1 ? 'GRP' : 'IND'}-${registration_id.split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          registration_id,
          user_id: registration.user_id,
          event_id: event.id,
          ticket_code: ticketCode,
          is_used: false
        }
      ])
      .select()
      .single();

    if (ticketError) throw ticketError;

    return res.status(200).json({
      success: true,
      message: 'Payment verified and ticket booked!',
      ticket_id: ticket.id
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({ success: false, message: 'Server verification process failed.' });
  }
};
