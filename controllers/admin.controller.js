const Case = require('../models/Case.model');
const User = require('../models/User.model');
const Drawing = require('../models/Drawing.model');
const Log = require('../models/Log.model'); 

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDrawingsScreened = await Case.countDocuments({});
    const flaggedCasesPending = await Case.countDocuments({ status: 'Flagged for Review' });
    const activeAssessors = await User.countDocuments({ role: 'Assessor', status: 'Active' });

    // Note: Average review time is a more complex aggregation. 
    // This is a simplified example. A real implementation might use a MongoDB aggregation pipeline.
    const completedCases = await Case.find({ 
        status: { $in: ['Completed - No Concerns', 'Completed - Follow-up Needed'] },
        flaggedAt: { $ne: null },
        completedAt: { $ne: null }
    });

    let totalReviewTime = 0;
    completedCases.forEach(c => {
        totalReviewTime += c.completedAt - c.flaggedAt; // time in milliseconds
    });

    const averageReviewTimeMs = completedCases.length > 0 ? totalReviewTime / completedCases.length : 0;
    const averageReviewTime = `${Math.round(averageReviewTimeMs / 60000)} min`; // in minutes

    res.status(200).json({
      totalDrawingsScreened,
      flaggedCasesPending,
      activeAssessors,
      averageReviewTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all cases for admin view (with filtering)
// @route   GET /api/admin/cases
// @access  Private (Admin)
exports.getAllCasesForAdmin = async (req, res) => {
    try {
        const cases = await Case.find({}).populate('drawing').populate('assessor', 'username');
        res.status(200).json(cases);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Reassign a case to a different assessor
// @route   PUT /api/admin/cases/:id/reassign
// @access  Private (Admin)
exports.reassignCase = async (req, res) => {
  const { newAssessorId } = req.body;

  try {
    const caseToReassign = await Case.findById(req.params.id);
    if (!caseToReassign) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const newAssessor = await User.findOne({ _id: newAssessorId, role: 'Assessor' });
    if (!newAssessor) {
      return res.status(404).json({ message: 'Assessor not found or user is not an assessor' });
    }

    caseToReassign.assessor = newAssessorId;
    await caseToReassign.save();

    res.status(200).json(caseToReassign);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// @desc    Get recent system logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getSystemLogs = async (req, res) => {
    try {
        const logs = await Log.find({})
                              .sort({ createdAt: -1 })
                              .limit(10) // Get the 10 most recent logs
                              .populate('user', 'username'); 
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};