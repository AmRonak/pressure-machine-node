const express = require('express');
const router = express.Router();
const { authenticateJWT, checkPermission } = require('../middleware/auth');
const masterParameterController = require('../controllers/masterParameterController');

router.get('/', authenticateJWT, masterParameterController.getMasterParameter);
router.patch('/', authenticateJWT, checkPermission('Master Settings'), masterParameterController.updateMasterParameter);

module.exports = router;
