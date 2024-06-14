const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const RecipeSetting = sequelize.define('RecipeSetting', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  initialPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000,
    validate: {
      min: 0,
      max: 1500
    }
  },
  setPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 750,
    validate: {
      min: 0,
      max: 1500
    }
  },
  leakTestPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 0,
      max: 1000
    }
  },
  lowerTestPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500,
    validate: {
      min: 0,
      max: 1000
    }
  },
  stabilizationTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 30,
      max: 900
    }
  },
  testTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 30,
      max: 900
    }
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  }
});

module.exports = RecipeSetting;
