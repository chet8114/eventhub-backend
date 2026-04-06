const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Conference', 'Workshop', 'Seminar', 'Concert', 'Sports', 'Meetup', 'Other'),
    defaultValue: 'Other',
  },
  event_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  available_seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  created_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'events',
});

module.exports = Event;
