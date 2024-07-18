const express = require('express');
const router = express.Router();
const { authenticateJWT, checkPermission } = require('../middleware/auth');
const parameterSettingController = require('../controllers/parameterSettingController');

router.get('/', authenticateJWT, parameterSettingController.getParameterSettings);
router.put('/', authenticateJWT, checkPermission('Parameter Settings'), parameterSettingController.updateParameterSettings);

module.exports = router;
