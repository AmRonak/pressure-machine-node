const { DataTypes } = require('sequelize');
const sequelize = require('./../sequelize');
const User = require('./user');
const ParameterSetting = require('./parameterSetting');

const TestResult = sequelize.define('TestResult', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  macId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  parameterSettingId: {
    type: DataTypes.INTEGER,
    references: {
      model: ParameterSetting,
      key: 'id',
    },
    allowNull: false,
  },
  gloveNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  setPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  actualPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stabilizationTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  endPressure: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  difference: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  result: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  testStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

TestResult.belongsTo(User, { foreignKey: 'userId' });
TestResult.belongsTo(ParameterSetting, { foreignKey: 'parameterSettingId' });

module.exports = TestResult;
