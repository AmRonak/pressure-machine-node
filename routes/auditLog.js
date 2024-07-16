const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/', authenticateJWT, auditLogController.createLog);
router.get('/filter', authenticateJWT, auditLogController.filterAuditLogs);

module.exports = router;
