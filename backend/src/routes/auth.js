// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendMail, isMailerConfigured } = require('../utils/mailer');

// ==========================
// Helper: Generate JWT Token
// ==========================
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  const payload = {
    user: {
      id: user._id,
      role: user.role
    }
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const ORGANIZER_INVITE_CODE = process.env.ORGANIZER_INVITE_CODE || process.env.ORGANIZER_CODE || '';
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || process.env.ADMIN_CODE || '';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || undefined);

// ==========================
// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
// ==========================
router.post(
  '/register',
  // Validation middleware
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { name, email, password, username, inviteCode } = req.body;

      // Check if user/email already exists
      let existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      if (username) {
        const existingUsername = await User.findOne({ username: username.trim() });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'Username already taken'
          });
        }
      }

      // Assign role based on invite code (only organizer, NOT admin for security)
      let role = 'user';
      if (inviteCode) {
        const normalizedInviteCode = inviteCode.trim();
        if (ORGANIZER_INVITE_CODE && normalizedInviteCode === ORGANIZER_INVITE_CODE) {
          role = 'organizer';
        } else {
          // Admin codes are NOT accepted in public registration for security
          return res.status(400).json({ success: false, message: 'Invalid invite code' });
        }
      }

      // Create new user (password hashed via pre-save hook)
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
          role: newUser.role,
          profileImage: newUser.profileImage || '',
          isActive: newUser.isActive,
        }
      });

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
      });
    }
  }
);

// ==========================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ==========================
router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Check user
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

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
          role: user.role,
          profileImage: user.profileImage || '',
          isActive: user.isActive,
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
      });
    }
  }
);

// ==========================
// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
// ==========================
router.post(
  '/google',
  body('credential').notEmpty().withMessage('Google credential is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ success: false, message: 'Google auth is not configured' });
      }

      const { credential } = req.body;
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload?.email_verified || !payload?.email) {
        return res.status(401).json({ success: false, message: 'Invalid Google account' });
      }

      const email = payload.email.toLowerCase().trim();
      const name = (payload.name || email.split('@')[0]).trim();
      const googleId = payload.sub;

      let user = await User.findOne({ email });
      if (!user) {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
        let username = baseUsername;
        let counter = 1;

        // Ensure unique username for Google onboarding.
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter += 1;
        }

        user = await User.create({
          name,
          email,
          username,
          googleId,
          role: 'user',
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (!user.name) user.name = name;
        await user.save();
      }

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Google login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          profileImage: user.profileImage || '',
          isActive: user.isActive,
        },
      });
    } catch (err) {
      console.error('Google login error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Server error during Google login',
        ...(process.env.NODE_ENV === 'development' && { details: err.message }),
      });
    }
  }
);

// ==========================
// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
// @access  Public
// ==========================
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Valid email is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      if (!isMailerConfigured) {
        return res.status(500).json({
          success: false,
          message: 'Email service is not configured. Please contact support.',
        });
      }

      const email = req.body.email.toLowerCase().trim();
      const user = await User.findOne({ email });

      // Return generic success even when user does not exist to avoid account enumeration.
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If this email is registered, a password reset link has been sent.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetExpiry = new Date(Date.now() + 1000 * 60 * 15);

      user.passwordResetToken = hashedResetToken;
      user.passwordResetExpires = resetExpiry;
      await user.save();

      const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      const resetLink = `${frontendBase}/reset-password?token=${resetToken}`;

      const emailResult = await sendMail({
        to: user.email,
        subject: 'Reset your Community Resource Board password',
        text: `We received a request to reset your password. Use this link within 15 minutes: ${resetLink}`,
        html: `<p>We received a request to reset your password.</p><p><a href="${resetLink}">Reset your password</a></p><p>This link will expire in 15 minutes.</p>`,
      });

      if (!emailResult.sent) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(500).json({
          success: false,
          message: 'Unable to send reset email right now. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a password reset link has been sent.',
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error while processing forgot password request',
        ...(process.env.NODE_ENV === 'development' && { details: err.message }),
      });
    }
  }
);

// ==========================
// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
// ==========================
router.post(
  '/reset-password',
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const { token, newPassword } = req.body;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+password');

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. Please login.',
      });
    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error while resetting password',
        ...(process.env.NODE_ENV === 'development' && { details: err.message }),
      });
    }
  }
);

module.exports = router;
