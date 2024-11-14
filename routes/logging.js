const express = require('express');
const router = express.Router();
const LoggingController = require('../controllers/loggingController');

// Create a new log entry
router.post('/', LoggingController.createLog);

// Get log entries with optional filters
router.get('/', LoggingController.getLogs);

// Update a log entry
router.put('/:id', LoggingController.updateLog);

// Delete a log entry
router.delete('/:id', LoggingController.deleteLog);

module.exports = router;
