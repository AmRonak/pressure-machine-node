const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Permission = sequelize.define('Permission', {
  module: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  superAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  administrator: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  manager: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  supervisor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  operator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Permission;
