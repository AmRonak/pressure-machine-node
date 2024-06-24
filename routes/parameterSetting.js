const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const parameterSettingController = require('../controllers/parameterSettingController');

router.get('/', authenticateJWT, parameterSettingController.getParameterSettings);
router.put('/', authenticateJWT, authorizeRole(['Administrator', 'Manager']), parameterSettingController.updateParameterSettings);

module.exports = router;
