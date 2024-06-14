const express = require('express');
const userRoutes = require('./user');
const recipeSetting = require('./recipeSetting');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/recipeSetting', recipeSetting);

module.exports = router;
