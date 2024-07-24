const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const permissionController = require('../controllers/permissionController');

router.get('/', authenticateJWT, permissionController.getPermissions);
router.put('/', authenticateJWT, permissionController.updatePermissions);

module.exports = router;
