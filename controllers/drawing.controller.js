const Drawing = require('../models/Drawing.model');
const Case = require('../models/Case.model');
const mlService = require('../services/ml.service');
const { getNextAssessor } = require('../services/assignment.service'); 
const { createLog } = require('../services/log.service');

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
      imageURL: req.file.path,
    });

    // 2. Trigger ML Analysis
    const mlOutput = await mlService.analyzeDrawing(newDrawing.imageURL);

    // 3. Check if the case is flagged for review
    const isFlagged = mlOutput.flaggedForReview;
    let assignedAssessorId = null;

    // --- AUTOMATIC ASSIGNMENT LOGIC ---
    if (isFlagged) {
      // If flagged, find the next available assessor
      assignedAssessorId = await getNextAssessor();
    }
    // ------------------------------------

    // 4. Create a Case based on the drawing and ML output
    const newCase = await Case.create({
      drawing: newDrawing._id,
      assessor: assignedAssessorId, // Assign the case here
      mlOutput,
      status: isFlagged ? 'Flagged for Review' : 'Completed - No Concerns',
      flaggedAt: isFlagged ? new Date() : null,
      completedAt: !isFlagged ? new Date() : null,
    });
    
    // 5. Create logs for the actions
    createLog(`Uploader '${req.user.username}' submitted drawing for child '${newDrawing.childId}'.`, req.user._id, newCase._id);
    if (isFlagged) {
        createLog(`Case for child '${newDrawing.childId}' was automatically flagged by ML engine.`, null, newCase._id);
        if (assignedAssessorId) {
            const assignedUser = await require('../models/User.model').findById(assignedAssessorId).select('username');
            createLog(`Case automatically assigned to '${assignedUser.username}'.`, null, newCase._id);
        } else {
            createLog(`Case requires manual assignment (no active assessors available).`, null, newCase._id);
        }
    }


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

// ... the getMyDrawings function remains the same

// @desc    Get drawings submitted by the logged-in uploader WITH case status
// @route   GET /api/drawings
// @access  Private (Uploader)
exports.getMyDrawings = async (req, res) => {
    try {
        const drawings = await Drawing.find({ uploader: req.user.id }).sort({ createdAt: -1 });

        // For each drawing, find its corresponding case
        const drawingsWithCases = await Promise.all(drawings.map(async (drawing) => {
            const caseItem = await Case.findOne({ drawing: drawing._id });
            return {
                ...drawing.toObject(),
                caseStatus: caseItem ? caseItem.status : 'Processing'
            };
        }));
        
        res.status(200).json(drawingsWithCases);
    } catch (error) {
        console.error('Error fetching my drawings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};