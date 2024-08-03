const AuditLog = require('../models/auditLog');
const RecipeSetting = require('../models/recipeSetting');
const AppError = require('../utils/AppError');

exports.updateRecipeSetting = async (req, res, next) => {
  const macId = req.macAddress;

  if (!macId) return next(new AppError('Can not identify mac id!', 404));

  const { initialPressure, setPressure, leakTestPressure, lowerTestPressure, stabilizationTime, testTime, comment } = req.body;

  try {
    let recipeSetting = await RecipeSetting.findOne({ where: { macId } });

    if (!recipeSetting) return next(new AppError('Recipe setting not found', 404));

    let oldRecipeSetting = { ...recipeSetting.dataValues };

    if (initialPressure !== undefined && initialPressure !== recipeSetting.initialPressure) {
      recipeSetting.initialPressure = initialPressure;
    }

    if (setPressure !== undefined && setPressure !== recipeSetting.setPressure) {
      recipeSetting.setPressure = setPressure;
    }
    
    if (leakTestPressure !== undefined && leakTestPressure !== recipeSetting.leakTestPressure) {
      recipeSetting.leakTestPressure = leakTestPressure;
    }
    if (lowerTestPressure !== undefined && lowerTestPressure !== recipeSetting.lowerTestPressure) {
      recipeSetting.lowerTestPressure = lowerTestPressure;
    }
    if (stabilizationTime !== undefined && stabilizationTime !== recipeSetting.stabilizationTime) {      
      recipeSetting.stabilizationTime = stabilizationTime;
    }
    if (testTime !== undefined && testTime !== recipeSetting.testTime) {
      recipeSetting.testTime = testTime;
    }
    if (comment !== undefined && comment !== recipeSetting.comment) {
      recipeSetting.comment = comment;
    }

    await recipeSetting.save();

    if (req.user.userLevel !== 'SuperAdmin') {

      if (initialPressure !== undefined && initialPressure !== oldRecipeSetting.initialPressure) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Initial Pressure Changed`,
          oldValue: oldRecipeSetting.initialPressure,
          newValue: initialPressure,
          category: 'general',
          comment: comment ? comment : ""
        });
      }
      if (setPressure !== undefined && setPressure !== oldRecipeSetting.setPressure) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Set Pressure Changed`,
          oldValue: oldRecipeSetting.setPressure,
          newValue: setPressure,
          category: 'general',
          comment: comment ? comment : ""
        });
      }
      if (leakTestPressure !== undefined && leakTestPressure !== oldRecipeSetting.leakTestPressure) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Leak Test Pressure Changed`,
          oldValue: oldRecipeSetting.leakTestPressure,
          newValue: leakTestPressure,
          category: 'general',
          comment: comment ? comment : ""
        });
      }
      if (lowerTestPressure !== undefined && lowerTestPressure !== oldRecipeSetting.lowerTestPressure) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Lower Test Pressure Changed`,
          oldValue: oldRecipeSetting.lowerTestPressure,
          newValue: lowerTestPressure,
          category: 'general',
          comment: comment ? comment : ""
        });
      }
      if (stabilizationTime !== undefined && stabilizationTime !== oldRecipeSetting.stabilizationTime) {      
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Stabilization Time Changed`,
          oldValue: oldRecipeSetting.stabilizationTime,
          newValue: stabilizationTime,
          category: 'general',
          comment: comment ? comment : ""
        });
      }
      if (testTime !== undefined && testTime !== oldRecipeSetting.testTime) {
        await AuditLog.create({
          userId: req.user.id,
          macId: req.macAddress,
          log: `Test Time Changed`,
          oldValue: oldRecipeSetting.testTime,
          newValue: testTime,
          category: 'general',
          comment: comment ? comment : ""
        });
      }
    }

    res.status(200).json(recipeSetting);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getRecipeSetting = async (req, res, next) => {
  const macId = req.macAddress;

  if (!macId) return next(new AppError('Can not identify mac id!', 404));

  try {
    let recipeSetting = await RecipeSetting.findOne({ where: { macId } });

    if (!recipeSetting) {
      // Create new record with default Recipe Settings
      recipeSetting = await RecipeSetting.create({
        macId
      });
    }

    res.status(200).json(recipeSetting);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
