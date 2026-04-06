const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  number_of_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1, max: 10 },
  },
  qr_code_data: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  booking_status: {
    type: DataTypes.ENUM('confirmed', 'cancelled', 'used'),
    defaultValue: 'confirmed',
    allowNull: false,
  },
}, {
  tableName: 'bookings',
});

module.exports = Booking;
