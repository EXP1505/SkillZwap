const express = require('express');
const User = require('../models/User');
const SessionRequest = require('../models/Session');
const router = express.Router();

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Get current logged-in user data (without password)
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get matching users (who teach skills current user wants to learn)
router.get('/matches', isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const matches = await User.find({
      _id: { $ne: req.session.userId },
      skillsToTeach: { $in: currentUser.skillsToLearn }
    }).select('-password');

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// You can add other dashboard related routes here, for example:
// Create session requests, accept requests, list requests, etc.

module.exports = router;
