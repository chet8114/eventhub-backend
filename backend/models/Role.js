const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.ENUM('admin', 'user', 'staff'),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'roles',
});

module.exports = Role;
