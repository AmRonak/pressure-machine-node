const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Adjust the path as needed
const User = require('./user'); // Adjust the path as needed

const AuditLog = sequelize.define('AuditLog', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  macId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  log: {
    type: DataTypes.STRING,
    allowNull: false
  },
  oldValue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  newValue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  }
});

// Establish the relationship with the User model
User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = AuditLog;
