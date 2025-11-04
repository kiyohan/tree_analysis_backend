const express = require('express');
const router = express.Router();
const { submitDrawing, getMyDrawings } = require('../controllers/drawing.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Uploader role can submit a drawing. The 'upload.single('image')' middleware handles the file.
router.post('/', protect, authorize('Uploader'), upload.single('image'), submitDrawing);
router.get('/', protect, authorize('Uploader'), getMyDrawings);

module.exports = router;