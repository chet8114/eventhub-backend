const { Booking, Event, User, AttendanceLog } = require('../models');

// Scan QR and validate
exports.scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    const staffId = req.user.id;

    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR data is required.' });
    }

    let parsed;
    try {
      parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format.', entryStatus: 'invalid' });
    }

    const { bookingId, userId, eventId } = parsed;

    if (!bookingId || !userId || !eventId) {
      return res.status(400).json({ success: false, message: 'Incomplete QR code data.', entryStatus: 'invalid' });
    }

    // Find booking
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'event_date'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: AttendanceLog, as: 'attendanceLog' },
      ],
    });

    if (!booking) {
      await AttendanceLog.create({
        booking_id: bookingId,
        scanned_by_staff_id: staffId,
        entry_status: 'invalid',
        scan_time: new Date(),
      }).catch(() => {});
      return res.status(404).json({ success: false, message: 'Booking not found.', entryStatus: 'invalid' });
    }

    // Verify user and event match
    if (booking.user_id !== userId || booking.event_id !== eventId) {
      return res.status(400).json({ success: false, message: 'QR code data mismatch.', entryStatus: 'invalid' });
    }

    // Check if cancelled
    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has been cancelled.', entryStatus: 'invalid' });
    }

    // Check for duplicate scan
    if (booking.booking_status === 'used' || booking.attendanceLog) {
      return res.status(409).json({
        success: false,
        message: 'This ticket has already been used.',
        entryStatus: 'duplicate',
        scanTime: booking.attendanceLog?.scan_time,
      });
    }

    // Mark as used and create attendance log
    await booking.update({ booking_status: 'used' });

    const attendanceLog = await AttendanceLog.create({
      booking_id: booking.id,
      scanned_by_staff_id: staffId,
      entry_status: 'valid',
      scan_time: new Date(),
    });

    res.json({
      success: true,
      message: '✅ Entry approved! Welcome to the event.',
      entryStatus: 'valid',
      details: {
        guestName: booking.user.name,
        eventTitle: booking.event.title,
        tickets: booking.number_of_tickets,
        scanTime: attendanceLog.scan_time,
      },
    });
  } catch (error) {
    console.error('ScanQR error:', error);
    res.status(500).json({ success: false, message: 'Server error during scan.' });
  }
};

// Get staff scan history
exports.getScanHistory = async (req, res) => {
  try {
    const logs = await AttendanceLog.findAll({
      where: { scanned_by_staff_id: req.user.id },
      include: [
        {
          model: Booking, as: 'booking',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Event, as: 'event', attributes: ['id', 'title'] },
          ],
        },
      ],
      order: [['scan_time', 'DESC']],
      limit: 50,
    });

    res.json({ logs });
  } catch (error) {
    console.error('GetScanHistory error:', error);
    res.status(500).json({ message: 'Server error fetching scan history.' });
  }
};
