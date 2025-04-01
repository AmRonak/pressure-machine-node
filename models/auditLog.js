const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const User = require('./user');

const AuditLog = sequelize.define('AuditLog', {
  id: { // Explicitly define the id
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  updatedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
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
  userLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

// Establish the relationship with the User model
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'UserLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'User' });

User.hasMany(AuditLog, { foreignKey: 'updatedUserId', as: 'UpdatedUserLogs' });
AuditLog.belongsTo(User, { foreignKey: 'updatedUserId', as: 'UpdatedUser' });

module.exports = AuditLog;
