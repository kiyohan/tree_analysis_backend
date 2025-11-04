const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/drawings', require('./drawing.routes'));
router.use('/cases', require('./case.routes'));
router.use('/users', require('./user.routes')); // For admin user management
router.use('/admin', require('./admin.routes')); // For admin dashboard

module.exports = router;