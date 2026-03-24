// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ✅ Helper: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, role: user.role } },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ✅ Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { name, email, password, username, inviteCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, username ? { username } : null]
    }).collation({ locale: 'en', strength: 2 });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase() ? 'User already exists with this email' : 'Username already taken'
      });
    }

    // Determine role from inviteCode
    let role = 'user';
    if (inviteCode) {
      if (inviteCode === 'ORGANIZER2024') role = 'organizer';
      else if (inviteCode === 'ADMIN2024') role = 'admin';
      else return res.status(400).json({ success: false, message: 'Invalid invite code' });
    }

    // Create user (password hashed in pre-save hook)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username ? username.trim() : email.split('@')[0],
      password,
      role
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration', ...(process.env.NODE_ENV === 'development' && { details: err.message }) });
  }
};

// ✅ Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login', ...(process.env.NODE_ENV === 'development' && { details: err.message }) });
  }
};

// ✅ Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('applications');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        profileImage: user.profileImage
      }
    });

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile', ...(process.env.NODE_ENV === 'development' && { details: err.message }) });
  }
};

module.exports = { register, login, getProfile };
