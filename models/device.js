const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Device = sequelize.define('Device', {
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  macId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Device;
