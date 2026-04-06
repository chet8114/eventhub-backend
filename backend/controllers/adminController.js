const { User, Event, Booking, AttendanceLog, sequelize } = require('../models');
const { exportToCSV } = require('../utils/csvExport');
const { Op } = require('sequelize');

// Dashboard analytics
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalStaff = await User.count({ where: { role: 'staff' } });
    const totalEvents = await Event.count();
    const totalBookings = await Booking.count({ where: { booking_status: { [Op.ne]: 'cancelled' } } });
    const totalAttendance = await AttendanceLog.count({ where: { entry_status: 'valid' } });

    // Event-wise attendance
    const eventStats = await Event.findAll({
      attributes: [
        'id', 'title', 'capacity', 'available_seats', 'event_date',
        [sequelize.literal(`(SELECT COUNT(*) FROM bookings WHERE bookings.event_id = Event.id AND bookings.booking_status != 'cancelled')`), 'totalBookings'],
        [sequelize.literal(`(SELECT COUNT(*) FROM attendance_logs al INNER JOIN bookings b ON al.booking_id = b.id WHERE b.event_id = Event.id AND al.entry_status = 'valid')`), 'totalAttendance'],
      ],
      order: [['event_date', 'DESC']],
      limit: 20,
    });

    // Recent bookings
    const recentBookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    res.json({
      stats: { totalUsers, totalStaff, totalEvents, totalBookings, totalAttendance },
      eventStats,
      recentBookings,
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    res.json({ users });
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['admin', 'user', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.update({ role });
    res.json({ message: `User role updated to ${role}.`, user: { id: user.id, name: user.name, email: user.email, role } });
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    res.status(500).json({ message: 'Server error updating user role.' });
  }
};

// Get attendance logs
exports.getAttendanceLogs = async (req, res) => {
  try {
    const { event_id, status } = req.query;
    const where = {};
    if (status) where.entry_status = status;

    const include = [
      {
        model: Booking, as: 'booking',
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Event, as: 'event', attributes: ['id', 'title', 'event_date'] },
        ],
        ...(event_id ? { where: { event_id: parseInt(event_id) } } : {}),
      },
      { model: User, as: 'scannedBy', attributes: ['id', 'name'] },
    ];

    const logs = await AttendanceLog.findAll({
      where,
      include,
      order: [['scan_time', 'DESC']],
    });

    res.json({ logs });
  } catch (error) {
    console.error('GetAttendanceLogs error:', error);
    res.status(500).json({ message: 'Server error fetching attendance logs.' });
  }
};

// Export attendance as CSV
exports.exportAttendanceCSV = async (req, res) => {
  try {
    const logs = await AttendanceLog.findAll({
      include: [
        {
          model: Booking, as: 'booking',
          include: [
            { model: User, as: 'user', attributes: ['name', 'email'] },
            { model: Event, as: 'event', attributes: ['title', 'event_date'] },
          ],
        },
        { model: User, as: 'scannedBy', attributes: ['name'] },
      ],
      order: [['scan_time', 'DESC']],
    });

    const data = logs.map(log => ({
      'Attendance ID': log.id,
      'Guest Name': log.booking?.user?.name || 'N/A',
      'Guest Email': log.booking?.user?.email || 'N/A',
      'Event Title': log.booking?.event?.title || 'N/A',
      'Event Date': log.booking?.event?.event_date || 'N/A',
      'Tickets': log.booking?.number_of_tickets || 0,
      'Scan Time': log.scan_time,
      'Entry Status': log.entry_status,
      'Scanned By': log.scannedBy?.name || 'N/A',
    }));

    const fields = ['Attendance ID', 'Guest Name', 'Guest Email', 'Event Title', 'Event Date', 'Tickets', 'Scan Time', 'Entry Status', 'Scanned By'];
    const csv = exportToCSV(data, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('ExportCSV error:', error);
    res.status(500).json({ message: 'Server error exporting CSV.' });
  }
};

// Get event stats
exports.getEventStats = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Booking, as: 'bookings',
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: AttendanceLog, as: 'attendanceLog' },
          ],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const totalBookings = event.bookings.filter(b => b.booking_status !== 'cancelled').length;
    const totalAttended = event.bookings.filter(b => b.attendanceLog && b.attendanceLog.entry_status === 'valid').length;
    const totalCancelled = event.bookings.filter(b => b.booking_status === 'cancelled').length;

    res.json({
      event: { id: event.id, title: event.title, capacity: event.capacity, available_seats: event.available_seats },
      stats: { totalBookings, totalAttended, totalCancelled, attendanceRate: totalBookings > 0 ? ((totalAttended / totalBookings) * 100).toFixed(1) : 0 },
      bookings: event.bookings,
    });
  } catch (error) {
    console.error('GetEventStats error:', error);
    res.status(500).json({ message: 'Server error fetching event stats.' });
  }
};
