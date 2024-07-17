const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const RecipeSetting = sequelize.define('RecipeSetting', {
  macId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Setting already available, You can only update it!'
  }
  },
  initialPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000,
    validate: {
      min: {
        args: [0],
        msg: 'Initial Pressure must be at least 0 and cannot exceed 1500'
      },
      max: {
        args: [1500],
        msg: 'Initial Pressure must be at least 0 and cannot exceed 1500'
      }
    }
  },
  setPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 750,
    validate: {
      min: {
        args: [0],
        msg: 'Set Pressure must be at least 0 and cannot exceed 1500'
      },
      max: {
        args: [1500],
        msg: 'Set Pressure must be at least 0 and cannot exceed 1500'
      }
    }
  },
  leakTestPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: {
        args: [0],
        msg: 'Leak Test Pressure must be at least 0 and cannot exceed 1000'
      },
      max: {
        args: [1000],
        msg: 'Leak Test Pressure must be at least 0 and cannot exceed 1000'
      }
    }
  },
  lowerTestPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500,
    validate: {
      min: {
        args: [0],
        msg: 'Lower Test Pressure must be at least 0 and cannot exceed 1000'
      },
      max: {
        args: [1000],
        msg: 'Lower Test Pressure must be at least 0 and cannot exceed 1000'
      }
    }
  },
  stabilizationTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: {
        args: [30],
        msg: 'Stabilization Time must be at least 30 and cannot exceed 900'
      },
      max: {
        args: [900],
        msg: 'Stabilization Time must be at least 30 and cannot exceed 900'
      }
    }
  },
  testTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: {
        args: [30],
        msg: 'Test Time must be at least 30 and cannot exceed 900'
      },
      max: {
        args: [900],
        msg: 'Test Time must be at least 30 and cannot exceed 900'
      }
    }
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  }
});

module.exports = RecipeSetting;
