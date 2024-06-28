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

    if (initialPressure !== undefined && initialPressure !== recipeSetting.initialPressure) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Initial Pressure Changed`,
        oldValue: recipeSetting.initialPressure,
        newValue: initialPressure,
        category: 'general'
      });
      recipeSetting.initialPressure = initialPressure;
    }

    if (setPressure !== undefined && setPressure !== recipeSetting.setPressure) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Set Pressure Changed`,
        oldValue: recipeSetting.setPressure,
        newValue: setPressure,
        category: 'general'
      });
      recipeSetting.setPressure = setPressure;
    }
    
    if (leakTestPressure !== undefined && leakTestPressure !== recipeSetting.leakTestPressure) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Leak Test Pressure Changed`,
        oldValue: recipeSetting.leakTestPressure,
        newValue: leakTestPressure,
        category: 'general'
      });
      recipeSetting.leakTestPressure = leakTestPressure;
    }
    if (lowerTestPressure !== undefined && lowerTestPressure !== recipeSetting.lowerTestPressure) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Lower Test Pressure Changed`,
        oldValue: recipeSetting.lowerTestPressure,
        newValue: lowerTestPressure,
        category: 'general'
      });
      recipeSetting.lowerTestPressure = lowerTestPressure;
    }
    if (stabilizationTime !== undefined && stabilizationTime !== recipeSetting.stabilizationTime) {      
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Stabilization Time Changed`,
        oldValue: recipeSetting.stabilizationTime,
        newValue: stabilizationTime,
        category: 'general'
      });
      recipeSetting.stabilizationTime = stabilizationTime;
    }
    if (testTime !== undefined && testTime !== recipeSetting.testTime) {
      await AuditLog.create({
        userId: req.user.id,
        macId: req.macAddress,
        log: `Test Time Changed`,
        oldValue: recipeSetting.testTime,
        newValue: testTime,
        category: 'general'
      });
      recipeSetting.testTime = testTime;
    }
    recipeSetting.comment = comment;

    await recipeSetting.save();

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
