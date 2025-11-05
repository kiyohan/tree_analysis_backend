const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { createLog } = require('../services/log.service');

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
    },
  });
  // ... in login function, after successful login:
  createLog(`User '${user.username}' logged in.`, user._id);
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    // req.user is set by the protect middleware
    res.status(200).json(req.user);
};