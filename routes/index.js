const express = require('express');
const userRoutes = require('./user');
const recipeSetting = require('./recipeSetting');
const parameterSetting = require('./parameterSetting');
const masterParameter = require('./masterParameter');
const auditLog = require('./auditLog');
const testResult = require('./testResult');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/recipeSetting', recipeSetting);
router.use('/parameterSetting', parameterSetting);
router.use('/masterParameter', masterParameter);
router.use('/auditLog', auditLog);
router.use('/testResult', testResult);

module.exports = router;
