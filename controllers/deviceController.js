const { Op } = require('sequelize');
const AuditLog = require('../models/auditLog');
const AppError = require('../utils/AppError');
const User = require('../models/user');
const Device = require('../models/device');

exports.getAllDevices = async (req, res, next) => {

  try {
    const devices = await Device.findAll();

    res.status(200).json(devices);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};