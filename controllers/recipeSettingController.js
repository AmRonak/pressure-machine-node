const RecipeSetting = require('../models/recipeSetting');
const AppError = require('../utils/AppError');

exports.updateRecipeSetting = async (req, res, next) => {
  const macId = req.macAddress;

  if (!macId) return next(new AppError('Can not identify mac id!', 404));

  const { initialPressure, setPressure, leakTestPressure, lowerTestPressure, stabilizationTime, testTime, comment } = req.body;

  try {
    let recipeSetting = await RecipeSetting.findOne({ where: { macId } });

    if (!recipeSetting) return next(new AppError('Recipe setting not found', 404));

    recipeSetting.initialPressure = initialPressure || recipeSetting.initialPressure;
    recipeSetting.setPressure = setPressure || recipeSetting.setPressure;
    recipeSetting.leakTestPressure = leakTestPressure || recipeSetting.leakTestPressure;
    recipeSetting.lowerTestPressure = lowerTestPressure || recipeSetting.lowerTestPressure;
    recipeSetting.stabilizationTime = stabilizationTime || recipeSetting.stabilizationTime;
    recipeSetting.testTime = testTime || recipeSetting.testTime;
    recipeSetting.comment = comment || recipeSetting.comment;

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
