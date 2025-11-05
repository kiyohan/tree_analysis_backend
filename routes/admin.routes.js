const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllCasesForAdmin,
    reassignCase,
    getSystemLogs
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// All these routes are protected and require Admin role
router.use(protect, authorize('Admin'));

router.get('/analytics', getDashboardStats);
router.get('/cases', getAllCasesForAdmin);
router.put('/cases/:id/reassign', reassignCase);
router.get('/logs', getSystemLogs);

module.exports = router;