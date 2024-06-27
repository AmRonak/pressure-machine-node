const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');

router.post('/', auditLogController.createLog);

module.exports = router;
