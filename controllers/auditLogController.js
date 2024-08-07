const { Op } = require('sequelize');
const AuditLog = require('../models/auditLog');
const AppError = require('../utils/AppError');
const User = require('../models/user');

exports.createLog = async (req, res, next) => {
  const { log, oldValue, newValue, category, comment } = req.body;

  if (req.user.userLevel === "SuperAdmin") {
    next(new AppError("Super Admin does not have permission to create log!", 401));
  }

  try {
    const auditLog = await AuditLog.create({
      userId: req.user.id,
      macId: req.macAddress,
      log,
      oldValue,
      newValue,
      category,
      comment
    });

    res.status(201).json(auditLog);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.filterAuditLogs = async (req, res, next) => {
  try {
    const { fromDate, toDate, username, category } = req.query;

    const whereClause = {};

    if (fromDate) {
      whereClause.createdAt = { [Op.gte]: new Date(fromDate) };
    }

    if (toDate) {
      whereClause.createdAt = whereClause.createdAt || {};
      whereClause.createdAt[Op.lte] = new Date(toDate);
    }

    if (category) {
      whereClause.category = category;
    }

    if (username) {
      let user = await User.findOne({
        where: {
          username: username
        }
      });

      if (user) {
        whereClause.userId = user.id;
      }
    }

    let auditLogs = await AuditLog.findAll({
      where: whereClause,
      include: [
        {
          model: User, 
          as: 'User', 
          attributes: ['username', 'userLevel'],
          where: { userLevel: { [Op.ne]: 'SuperAdmin' } }
        },
        { model: User, as: 'UpdatedUser', attributes: ['username'] }
      ]
    });
    res.status(200).json(auditLogs);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};