const express = require('express');
const router = express.Router();
const { getAssignedCases, getCaseById, submitReview } = require('../controllers/case.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Assessor can get their assigned cases
router.get('/', protect, authorize('Assessor'), getAssignedCases);

// Assessor and Admin can get a single case
router.get('/:id', protect, authorize('Assessor', 'Admin'), getCaseById);

// Assessor can submit a review
router.post('/:id/review', protect, authorize('Assessor'), submitReview);

module.exports = router;