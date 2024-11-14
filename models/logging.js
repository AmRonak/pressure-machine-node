const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const User = require('./user');

const Logging = sequelize.define('Logging', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  data: {
    type: DataTypes.STRING,
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
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

// Define associations with the User model
User.hasMany(Logging, { foreignKey: 'userId', as: 'UserLoggings' });
Logging.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = Logging;
