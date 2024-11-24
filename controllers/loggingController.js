const { Op } = require('sequelize');
const Logging = require('../models/logging');

// Create a new log entry
exports.createLog = async (req, res) => {
  try {
    const { userid, deviceid, batchid, data, starttesttime, endtesttime } = req.body;
    const log = await Logging.create({ userid, deviceid, batchid, data, starttesttime, endtesttime });
    res.status(201).json(log);
  } catch (error) {
    console.log("errror", error);
    
    res.status(500).json({ error: 'Failed to create log entry.' });
  }
};

// Retrieve logs with optional filtering
exports.getLogs = async (req, res) => {
  const { batchid, starttesttime, endtesttime } = req.query;
  const whereClause = {};

  if (batchid) whereClause.batchid = batchid;
  if (starttesttime) whereClause.starttesttime = { [Op.gte]: new Date(starttesttime) };
  if (endtesttime) whereClause.endtesttime = { [Op.lte]: new Date(endtesttime) };

  try {
    const logs = await Logging.findAll({ where: whereClause });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs.' });
  }
};

// Update a log entry
exports.updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, starttesttime, endtesttime } = req.body;
    const log = await Logging.findByPk(id);

    if (!log) {
      return res.status(404).json({ error: 'Log entry not found.' });
    }

    await log.update({ data, starttesttime, endtesttime });
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update log entry.' });
  }
};

// Delete a log entry
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await Logging.findByPk(id);

    if (!log) {
      return res.status(404).json({ error: 'Log entry not found.' });
    }

    await log.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete log entry.' });
  }
};
