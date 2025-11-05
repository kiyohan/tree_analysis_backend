const Case = require('../models/Case.model');
const { createLog } = require('../services/log.service');

// @desc    Get cases assigned to the logged-in assessor
// @route   GET /api/cases
// @access  Private (Assessor)
exports.getAssignedCases = async (req, res) => {
    try {
        const cases = await Case.find({ assessor: req.user.id }).populate('drawing').sort({ createdAt: -1 });
        res.status(200).json(cases);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single case by ID
// @route   GET /api/cases/:id
// @access  Private (Assessor, Admin)
exports.getCaseById = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id).populate('drawing');
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }
        // Add logic here to ensure only the assigned assessor or an admin can view
        res.status(200).json(caseItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Submit a review for a case
// @route   POST /api/cases/:id/review
// @access  Private (Assessor)
exports.submitReview = async (req, res) => {
    const { finalStatus, assessorReport } = req.body;

    try {
        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }
        
        // Ensure the logged-in user is the assigned assessor
        if (caseItem.assessor.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to review this case' });
        }

        caseItem.status = finalStatus; // e.g., 'Completed - Follow-up Needed'
        caseItem.assessorReport = assessorReport;
        caseItem.completedAt = new Date();

        await caseItem.save();

        // ... in submitReview, after caseItem.save():
        createLog(`Assessor '${req.user.username}' completed review for case of child '${caseItem.drawing.childId}'.`, req.user._id, caseItem._id);

        res.status(200).json(caseItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};