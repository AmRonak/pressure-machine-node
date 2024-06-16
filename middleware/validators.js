const { body, validationResult } = require('express-validator');

const userValidationRules = () => {
  return [
    body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters long'),
    body('password')
      .isLength({ min: 5 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
    body('userLevel').isIn(['Operator', 'Supervisor', 'Manager', 'Administrator']).withMessage('Invalid user level'),
    body('attempts').isInt({ min: 0 }).withMessage('Number of attempts must be a positive integer'),
    body('autoLogoutTime').isInt({ min: 0 }).withMessage('Auto logout time must be a positive integer'),
    body('passwordExpiry').isInt({ min: 0 }).withMessage('Password expiry must be a positive integer'),
    body('expiryDaysNotification').isInt({ min: 0 }).withMessage('Expiry days notification must be a positive integer'),
    body('autoUnblockTime').isInt({ min: 0 }).withMessage('Auto unblock time must be a positive integer'),
    body('pin').isNumeric().withMessage('PIN must be a number').isLength({ min: 4, max: 4 }).withMessage('PIN must be exactly 4 characters long'),
    body('confirmPin').custom((value, { req }) => {
      if (value !== req.body.pin) {
        throw new Error('Confirm Pin does not match pin');
      }
      return true;
    }),
  ];
};

const loginValidationRules = () => {
  return [
    body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters long'),
  ];
};

const changePasswordValidationRules = () => {
  return [
    body('currentPassword')
      .exists()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 5 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  ];
};

const recipeSettingValidationRules = () => {
  return [
    body('initialPressure').optional().isInt({ min: 0, max: 1500 }).withMessage('Initial Pressure must be between 0 and 1500 Pa'),
    body('setPressure').optional().isInt({ min: 0, max: 1500 }).withMessage('Set Pressure must be between 0 and 1500 Pa'),
    body('leakTestPressure').optional().isInt({ min: 0, max: 1000 }).withMessage('Leak Test Pressure must be between 0 and 1000 Pa'),
    body('lowerTestPressure').optional().isInt({ min: 0, max: 1000 }).withMessage('Lower Test Pressure must be between 0 and 1000 Pa'),
    body('stabilizationTime').optional().isInt().isIn([30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900]).withMessage('Stabilization Time must be between 30 to 900'),
    body('testTime').optional().isInt().isIn([30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900]).withMessage('Test Time must be between 30 to 900'),
    body('comment').optional().isString().withMessage('Comment must be a string')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log("errors ", errors);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    status: "error",
    error: {
      "statusCode": 422,
      "status": "error",
      "isOperational": false
    },
    message: extractedErrors,
  });
};

module.exports = {
  userValidationRules,
  loginValidationRules,
  changePasswordValidationRules,
  recipeSettingValidationRules,
  validate,
};
