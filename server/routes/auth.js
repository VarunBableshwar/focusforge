const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Signup
router.post('/signup', async (req, res, next) => {
  console.log('Signup request received:', req.body);
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password });
    await user.save();
    console.log('User created successfully:', email);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  console.log('Login request received:', req.body.email);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper to check and reset streak if missed
const checkStreakBroken = async (user) => {
  if (!user.lastFocusDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(user.lastFocusDate);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    user.streak = 0;
    await user.save();
    return true;
  }
  return false;
};

// Helper to update streak on focus activity
const updateStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastFocusDate) {
    user.streak = 1;
    user.lastFocusDate = today;
    return;
  }

  const lastDate = new Date(user.lastFocusDate);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    user.streak += 1;
    user.lastFocusDate = today;
  } else if (diffDays > 1) {
    user.streak = 1;
    user.lastFocusDate = today;
  } else if (diffDays === 0) {
    // Already tracked for today
  }
};

// Get user data
router.get('/user', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await checkStreakBroken(user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update focus score
router.patch('/focus', auth, async (req, res) => {
  try {
    const { score, day } = req.body;
    if (!day) return res.status(400).json({ message: 'Day is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.focusScores[day] = score;
    updateStreak(user);
    await user.save();

    res.json({ message: 'Focus score updated', focusScores: user.focusScores, streak: user.streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update focus time per subject
router.patch('/focus-subject', auth, async (req, res) => {
  try {
    const { subject, incrementSecs } = req.body;
    if (!subject) return res.status(400).json({ message: 'Subject is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentTime = user.subjectFocusTime.get(subject) || 0;
    user.subjectFocusTime.set(subject, currentTime + incrementSecs);
    
    updateStreak(user);
    await user.save();

    res.json({ message: 'Subject focus time updated', subjectFocusTime: user.subjectFocusTime, streak: user.streak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;