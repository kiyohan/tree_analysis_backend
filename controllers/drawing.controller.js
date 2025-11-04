const Drawing = require('../models/Drawing.model');
const Case = require('../models/Case.model');
const mlService = require('../services/ml.service');

// @desc    Submit a new drawing
// @route   POST /api/drawings
// @access  Private (Uploader)
exports.submitDrawing = async (req, res) => {
  const { childId, childAge, teacherNotes } = req.body;
  const uploaderId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a drawing image' });
  }

  try {
    // 1. Create the Drawing record
    const newDrawing = await Drawing.create({
      uploader: uploaderId,
      childId,
      childAge,
      teacherNotes,
      imageURL: req.file.path, // URL from Cloudinary
    });

    // 2. Trigger ML Analysis (asynchronously, but we'll await it here for simplicity)
    const mlOutput = await mlService.analyzeDrawing(newDrawing.imageURL);

    // 3. Create a Case based on the drawing and ML output
    const newCase = await Case.create({
      drawing: newDrawing._id,
      mlOutput,
      status: mlOutput.flaggedForReview ? 'Flagged for Review' : 'Completed - No Concerns',
      flaggedAt: mlOutput.flaggedForReview ? new Date() : null,
      completedAt: !mlOutput.flaggedForReview ? new Date() : null,
    });

    res.status(201).json({
      message: 'Drawing submitted and analysis initiated successfully.',
      drawing: newDrawing,
      case: newCase,
    });
  } catch (error) {
    console.error('Error submitting drawing:', error);
    res.status(500).json({ message: 'Server error during drawing submission.' });
  }
};

// @desc    Get drawings submitted by the logged-in uploader
// @route   GET /api/drawings
// @access  Private (Uploader)
exports.getMyDrawings = async (req, res) => {
    try {
        const drawings = await Drawing.find({ uploader: req.user.id }).sort({ createdAt: -1 });
        // You might want to also populate the case status for each drawing here
        res.status(200).json(drawings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};