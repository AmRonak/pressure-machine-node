const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const masterParameterController = require('../controllers/masterParameterController');

router.get('/', authenticateJWT, masterParameterController.getMasterParameter);
router.patch('/', authenticateJWT, masterParameterController.updateMasterParameter);

module.exports = router;
