const mongoose = require('mongoose');

const DrawingSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId: { type: String, required: true },
  childAge: { type: Number, required: true },
  imageURL: { type: String, required: true },
  teacherNotes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Drawing', DrawingSchema);