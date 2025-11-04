const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  drawing: { type: mongoose.Schema.Types.ObjectId, ref: 'Drawing', required: true },
  assessor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Can be null initially
  status: {
    type: String,
    enum: [
      'Initial Screening', // ML analysis in progress or done
      'Flagged for Review', // ML flagged it, needs human review
      'Completed - No Concerns', // ML cleared or Assessor cleared
      'Completed - Follow-up Needed' // Assessor marked for follow-up
    ],
    default: 'Initial Screening',
  },
  mlOutput: { type: mongoose.Schema.Types.Mixed }, // To store the JSON output from the ML service
  assessorReport: { type: String },
  flaggedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Case', CaseSchema);