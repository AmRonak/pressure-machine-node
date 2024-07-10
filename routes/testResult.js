const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validators');
const { authenticateJWT } = require('../middleware/auth');
const testResultController = require('../controllers/testResultController');

const router = express.Router();

const testResultValidationRules = () => {
  return [
    body('gloveNumber').isString().withMessage('Glove Number must be a string'),
    body('setPressure').isInt().withMessage('Set Pressure must be an integer'),
    body('actualPressure').isInt().withMessage('Actual Pressure must be an integer'),
    body('stabilizationTime').isInt().withMessage('Stabilization Time must be an integer'),
    body('testTime').isInt().withMessage('Test Time must be an integer'),
    body('startPressure').isInt().withMessage('Start Pressure must be an integer'),
    body('endPressure').isInt().withMessage('End Pressure must be an integer'),
    body('result').isString().withMessage('Result must be a string'),
    body('testStatus').isString().withMessage('Test Status must be a string'),
  ];
};

router.post(
  '/',
  authenticateJWT,
  testResultValidationRules(),
  validate,
  testResultController.createTestResult
);

module.exports = router;
