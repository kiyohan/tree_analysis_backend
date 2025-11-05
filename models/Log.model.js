const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);