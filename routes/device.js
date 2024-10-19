const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authenticateJWT } = require('../middleware/auth');

router.get('/', deviceController.getAllDevices);

module.exports = router;
