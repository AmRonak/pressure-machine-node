const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const ParameterSetting = sequelize.define('ParameterSetting', {
  macId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Setting already available, You can only update it!'
  }
  },
  companyName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  departmentName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  equipmentName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  equipmentSerialNo: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  defaultComment: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  areaName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  batchName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  batchNo: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  leakTestStatus: {
    type: DataTypes.ENUM('Before', 'After'),
    defaultValue: 'Before',
    validate: {
      isIn: {
        args: [['Before', 'After']],
        msg: 'Leak Test Status must be Before or After'
      }
    }
  },
  printComment: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  }
});

module.exports = ParameterSetting;
