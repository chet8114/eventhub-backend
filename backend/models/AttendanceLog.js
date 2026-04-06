const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttendanceLog = sequelize.define('AttendanceLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  scan_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  scanned_by_staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entry_status: {
    type: DataTypes.ENUM('valid', 'duplicate', 'invalid'),
    allowNull: false,
    defaultValue: 'valid',
  },
}, {
  tableName: 'attendance_logs',
});

module.exports = AttendanceLog;
