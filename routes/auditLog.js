const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateJWT, checkPermission } = require('../middleware/auth');

router.post('/', authenticateJWT, auditLogController.createLog);
router.get('/filter', authenticateJWT, checkPermission('Report'), auditLogController.filterAuditLogs);

module.exports = router;
