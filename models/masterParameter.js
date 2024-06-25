const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const MasterParameter = sequelize.define('MasterParameter', {
  macId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  gasketPressure: {
    type: DataTypes.INTEGER,
    defaultValue: 125,
    validate: {
      min: 0,
      max: 200
    }
  },
  gasketPressureAlarmTime: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: 0,
      max: 120
    }
  },
  glovePressureAlarmTime: {
    type: DataTypes.INTEGER,
    defaultValue: 300,
    validate: {
      min: 0,
      max: 600
    }
  },
  pressurePursuingPressure: {
    type: DataTypes.INTEGER,
    defaultValue: 850,
    validate: {
      min: 0,
      max: 1500
    }
  },
  pressurePursuingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: 0,
      max: 120
    }
  },
  glovePressure: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    validate: {
      min: 0,
      max: 1500
    }
  },
  valveOnTime: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    validate: {
      min: 0,
      max: 10000
    }
  },
  valveOffTime: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    validate: {
      min: 0,
      max: 10000
    }
  }
});

module.exports = MasterParameter;
