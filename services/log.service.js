const Log = require('../models/Log.model');

/**
 * Creates a system log entry.
 * @param {string} message - The log message.
 * @param {string} [userId] - Optional ID of the user performing the action.
 * @param {string} [caseId] - Optional ID of the case related to the action.
 */
exports.createLog = async (message, userId = null, caseId = null) => {
  try {
    await Log.create({ message, user: userId, case: caseId });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
};