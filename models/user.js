const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: 'Username already in use!'
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userLevel: {
        type: DataTypes.ENUM,
        values: ['Operator', 'Supervisor', 'Manager', 'Administrator'],
        allowNull: false
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    failedAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    pin: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    autoLogoutTime: {
        type: DataTypes.INTEGER,
        defaultValue: 60 // Default to 30 minutes
    },
    passwordExpiry: {
        type: DataTypes.INTEGER,
        defaultValue: 90 // Default to 90 days
    },
    expiryDaysNotification: {
        type: DataTypes.INTEGER,
        defaultValue: 10 // Notify 10 days before expiry
    },
    autoUnblockTime: {
        type: DataTypes.INTEGER,
        defaultValue: 15 // Default to 15 minutes
    },
    blockTime: {
        type: DataTypes.DATE
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = User;
