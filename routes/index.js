const express = require('express');
const userRoutes = require('./user');
const recipeSetting = require('./recipeSetting');
const parameterSetting = require('./parameterSetting');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/recipeSetting', recipeSetting);
router.use('/parameterSetting', parameterSetting);

module.exports = router;
