const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// All these routes are protected and require Admin role
router.use(protect, authorize('Admin'));

router.route('/')
  .post(createUser)
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;