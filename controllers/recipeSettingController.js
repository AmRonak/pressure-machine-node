const RecipeSetting = require('../models/recipeSetting');
const AppError = require('../utils/AppError');

exports.updateRecipeSetting = async (req, res, next) => {
  const userId = req.user.id;
  const { initialPressure, setPressure, leakTestPressure, lowerTestPressure, stabilizationTime, testTime, comment } = req.body;

  try {
    const recipeSetting = await RecipeSetting.findOne({ where: { userId } });

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
  const userId = req.user.id;

  try {
    const recipeSetting = await RecipeSetting.findOne({ where: { userId } });

    if (!recipeSetting) return next(new AppError('Recipe setting not found', 404));

    res.status(200).json(recipeSetting);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
