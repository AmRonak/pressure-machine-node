const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const parameterSettingController = require('../controllers/parameterSettingController');

router.get('/', authenticateJWT, parameterSettingController.getParameterSettings);
router.put('/', authenticateJWT, parameterSettingController.updateParameterSettings);

module.exports = router;
