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
    body('pin').isInt({ min: 1000, max: 9999 }).withMessage('PIN must be a number between 1000 and 9999'),
    body('confirmPin').custom((value, { req }) => {
      if (value !== req.body.pin) {
        throw new Error('Confirm Pin does not match pin');
      }
      return true;
    }),
    // body('active').isBoolean().withMessage('Active must be a boolean')
  ];
};

const loginValidationRules = () => {
  return [
    body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters long'),
    body('password').exists().withMessage('Password is required')
  ];
};

const passwordResetValidationRules = () => {
  return [
    body('username').isAlphanumeric().isLength({ min: 3, max: 30 }).withMessage('Username must be alphanumeric and 3-30 characters long'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('New password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
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
  passwordResetValidationRules,
  validate,
};
