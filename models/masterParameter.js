const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const MasterParameter = sequelize.define('MasterParameter', {
  // macId: {
  //   type: DataTypes.STRING,
  //   unique: true,
  //   allowNull: false
  // },
  gasketPressure: {
    type: DataTypes.INTEGER,
    defaultValue: 125,
    validate: {
      min: {
        args: [0],
        msg: 'Gasket Pressure must be at least 0 and cannot exceed 200'
      },
      max: {
        args: [200],
        msg: 'Gasket Pressure must be at least 0 and cannot exceed 200'
      },
    }
  },
  gasketPressureAlarmTime: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: {
        args: [0],
        msg: 'Gasket Pressure Alarm Time must be at least 0 and cannot exceed 120'
      },
      max: {
        args: [120],
        msg: 'Gasket Pressure Alarm Time must be at least 0 and cannot exceed 120'
      },
    }
  },
  glovePressureAlarmTime: {
    type: DataTypes.INTEGER,
    defaultValue: 300,
    validate: {
      min: {
        args: [0],
        msg: 'Glove Pressure Alarm Time must be at least 0 and cannot exceed 600'
      },
      max: {
        args: [600],
        msg: 'Glove Pressure Alarm Time must be at least 0 and cannot exceed 600'
      },
    }
  },
  pressurePursuingPressure: {
    type: DataTypes.INTEGER,
    defaultValue: 850,
    validate: {
      min: {
        args: [0],
        msg: 'Pressure Pursuing must be at least 0 and cannot exceed 1500'
      },
      max: {
        args: [1500],
        msg: 'Pressure Pursuing must be at least 0 and cannot exceed 1500'
      }
    }
  },
  pressurePursuingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: {
        args: [0],
        msg: 'Pressure Pursuing Time must be at least 0 and cannot exceed 120'
      },
      max: {
        args: [120],
        msg: 'Pressure Pursuing Time must be at least 0 and cannot exceed 120'
      },
    }
  },
  glovePressure: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    validate: {
      min: {
        args: [0],
        msg: 'Glove Pressure must be at least 0 and cannot exceed 1500'
      },
      max: {
        args: [1500],
        msg: 'Glove Pressure must be at least 0 and cannot exceed 1500'
      }
    }
  },
  valveOnTime: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    validate: {
      min: {
        args: [0],
        msg: 'Valve On Time must be at least 0 and cannot exceed 10000'
      },
      max: {
        args: [10000],
        msg: 'Valve On Time must be at least 0 and cannot exceed 10000'
      },
    }
  },
  valveOffTime: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    validate: {
      min: {
        args: [0],
        msg: 'Valve Off Time must be at least 0 and cannot exceed 10000'
      },
      max: {
        args: [10000],
        msg: 'Valve Off Time must be at least 0 and cannot exceed 10000'
      },
    }
  },
  motor1: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  motor2: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  motor3: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  valve1: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  valve2: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = MasterParameter;
