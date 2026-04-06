const { Booking, Event, User, AttendanceLog } = require('../models');
const { generateQRCode } = require('../utils/qrGenerator');
const { sendBookingConfirmation } = require('../utils/emailService');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { event_id, number_of_tickets } = req.body;
    const userId = req.user.id;

    if (!event_id || !number_of_tickets) {
      return res.status(400).json({ message: 'Event ID and number of tickets are required.' });
    }

    const tickets = parseInt(number_of_tickets);
    if (tickets < 1 || tickets > 10) {
      return res.status(400).json({ message: 'You can book between 1 and 10 tickets.' });
    }

    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (new Date(event.event_date) < new Date()) {
      return res.status(400).json({ message: 'Cannot book tickets for past events.' });
    }

    if (event.available_seats < tickets) {
      return res.status(400).json({ message: `Only ${event.available_seats} seats available.` });
    }

    // Check if user already has a confirmed booking for this event
    const existingBooking = await Booking.findOne({
      where: { user_id: userId, event_id, booking_status: 'confirmed' },
    });
    if (existingBooking) {
      return res.status(409).json({ message: 'You already have a confirmed booking for this event.' });
    }

    // Create booking
    const booking = await Booking.create({
      user_id: userId,
      event_id,
      number_of_tickets: tickets,
      booking_status: 'confirmed',
    });

    // Generate QR code data
    const qrPayload = {
      bookingId: booking.id,
      userId: userId,
      eventId: event_id,
    };
    const qrCodeDataURL = await generateQRCode(qrPayload);
    await booking.update({ qr_code_data: qrCodeDataURL });

    // Decrement available seats
    await event.update({ available_seats: event.available_seats - tickets });

    // Send confirmation email (non-blocking)
    const user = await User.findByPk(userId);
    sendBookingConfirmation(user.email, {
      bookingId: booking.id,
      eventTitle: event.title,
      eventDate: event.event_date,
      location: event.location,
      numberOfTickets: tickets,
    }).catch(err => console.error('Email error:', err));

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: {
        id: booking.id,
        event_id: booking.event_id,
        number_of_tickets: booking.number_of_tickets,
        booking_status: booking.booking_status,
        qr_code_data: qrCodeDataURL,
        created_at: booking.created_at,
      },
    });
  } catch (error) {
    console.error('CreateBooking error:', error);
    res.status(500).json({ message: 'Server error creating booking.' });
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'location', 'event_date', 'category'] },
        { model: AttendanceLog, as: 'attendanceLog' },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ bookings });
  } catch (error) {
    console.error('GetMyBookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings.' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Event, as: 'event' }],
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel your own bookings.' });
    }

    if (booking.booking_status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled.' });
    }

    if (new Date(booking.event.event_date) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel bookings for past events.' });
    }

    await booking.update({ booking_status: 'cancelled' });

    // Restore seats
    await booking.event.update({
      available_seats: booking.event.available_seats + booking.number_of_tickets,
    });

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('CancelBooking error:', error);
    res.status(500).json({ message: 'Server error cancelling booking.' });
  }
};

// Get QR code for booking
exports.getBookingQR = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.user_id !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!booking.qr_code_data) {
      // Regenerate if missing
      const qrPayload = { bookingId: booking.id, userId: booking.user_id, eventId: booking.event_id };
      const qrCodeDataURL = await generateQRCode(qrPayload);
      await booking.update({ qr_code_data: qrCodeDataURL });
      return res.json({ qr_code: qrCodeDataURL });
    }

    res.json({ qr_code: booking.qr_code_data });
  } catch (error) {
    console.error('GetBookingQR error:', error);
    res.status(500).json({ message: 'Server error fetching QR code.' });
  }
};
