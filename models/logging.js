const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Logging = sequelize.define('Logging', {
  id: { // Explicitly define the id
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batchid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  starttesttime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endtesttime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Logging;
