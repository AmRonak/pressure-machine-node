const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const permissionController = require('../controllers/permissionController');

router.get('/', authenticateJWT, authorizeRole(['Administrator', 'Super Admin']), permissionController.getPermissions);
router.put('/', authenticateJWT, authorizeRole(['Administrator', 'Super Admin']), permissionController.updatePermissions);

module.exports = router;
