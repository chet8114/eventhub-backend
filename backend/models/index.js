const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Event = require('./Event');
const Booking = require('./Booking');
const AttendanceLog = require('./AttendanceLog');

// ── Associations ──

// User → Events (admin creates events)
User.hasMany(Event, { foreignKey: 'created_by_admin_id', as: 'createdEvents' });
Event.belongsTo(User, { foreignKey: 'created_by_admin_id', as: 'creator' });

// User → Bookings
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Event → Bookings
Event.hasMany(Booking, { foreignKey: 'event_id', as: 'bookings' });
Booking.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Booking → AttendanceLog
Booking.hasOne(AttendanceLog, { foreignKey: 'booking_id', as: 'attendanceLog' });
AttendanceLog.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User (staff) → AttendanceLog
User.hasMany(AttendanceLog, { foreignKey: 'scanned_by_staff_id', as: 'scans' });
AttendanceLog.belongsTo(User, { foreignKey: 'scanned_by_staff_id', as: 'scannedBy' });

module.exports = {
  sequelize,
  User,
  Role,
  Event,
  Booking,
  AttendanceLog,
};
