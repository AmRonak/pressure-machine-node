const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const masterParameterController = require('../controllers/masterParameterController');

router.get('/', authenticateJWT, masterParameterController.getMasterParameter);
router.patch('/', authenticateJWT, authorizeRole(['Administrator', 'Manager']), masterParameterController.updateMasterParameter);

module.exports = router;
