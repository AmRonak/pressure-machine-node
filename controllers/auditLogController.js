const AuditLog = require('../models/auditLog');
const AppError = require('../utils/AppError');

exports.createLog = async (req, res, next) => {
  const { log, oldValue, newValue, category } = req.body;

  try {
    const auditLog = await AuditLog.create({
      userId,
      macId,
      log,
      oldValue,
      newValue,
      category
    });

    res.status(201).json(auditLog);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
