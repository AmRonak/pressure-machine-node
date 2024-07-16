const ParameterSetting = require('../models/parameterSetting');
const TestResult = require('../models/testResult');
const User = require('../models/user');
const AppError = require('../utils/AppError');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

exports.createTestResult = async (req, res, next) => {
  try {
    const macId = req.macAddress;
    const {
      gloveNumber,
      setPressure,
      actualPressure,
      stabilizationTime,
      testTime,
      startPressure,
      endPressure,
      result,
      testStatus,
    } = req.body;

    const difference = startPressure - endPressure;

    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(400).json({ message: 'Invalid user!' });

    const parameterSetting = await ParameterSetting.findOne({ where: { macId } });

    if (!parameterSetting) return next(new AppError('Batch Number not found', 404));

    const newTestResult = await TestResult.create({
      userId: req.user.id,
      gloveNumber,
      setPressure,
      actualPressure,
      stabilizationTime,
      testTime,
      startPressure,
      endPressure,
      difference,
      result,
      parameterSettingId: parameterSetting.id, 
      batchNumber: parameterSetting.batchNo,
      userName: user.username,
      testStatus,
      macId: macId
    });

    res.status(201).json(newTestResult);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getUniqueBatchNumbers = async (req, res, next) => {
  try {
    const macId = req.macAddress;
    
    if (!macId) {
      return res.status(400).json({ message: 'macId is required' });
    }

    const uniqueBatchNumbers = await TestResult.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('batchNumber')), 'batchNumber']],
      where: { macId },
    });

    const batchNumbers = uniqueBatchNumbers.map(result => result.batchNumber);

    res.status(200).json({ batchNumbers });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.filterTestResults = async (req, res, next) => {
  try {
    const { fromDate, toDate, batchNumber } = req.query;

    const whereClause = {};

    if (fromDate) {
      whereClause.createdAt = { [Op.gte]: new Date(fromDate) };
    }

    if (toDate) {
      whereClause.createdAt = whereClause.createdAt || {};
      whereClause.createdAt[Op.lte] = new Date(toDate);
    }

    if (batchNumber) {
      whereClause.batchNumber = batchNumber;
    }

    const testResults = await TestResult.findAll({
      where: whereClause,
    });

    res.status(200).json(testResults);
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
