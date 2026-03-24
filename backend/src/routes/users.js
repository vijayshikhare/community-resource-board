// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resource = require('../models/Resource');
const Application = require('../models/Application');
const auth = require('../middlewares/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileUploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profileUploadsDir)) fs.mkdirSync(profileUploadsDir, { recursive: true });

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileUploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `profile-${req.user.id}-${Date.now()}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (allowed.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  },
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('applications');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, bio, skills, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (typeof name === 'string') user.name = name.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (Array.isArray(skills)) {
      user.skills = skills.map((skill) => String(skill).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      user.skills = skills.split(',').map((skill) => skill.trim()).filter(Boolean);
    }
    if (typeof profileImage === 'string') user.profileImage = profileImage.trim();

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// @route   PUT /api/users/profile/photo
// @desc    Upload profile photo
// @access  Private
router.put('/profile/photo', auth, profileUpload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Profile photo is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profileImage && user.profileImage.startsWith('/uploads/profiles/')) {
      const normalizedRelativePath = user.profileImage.replace(/^[/\\]+/, '');
      const existingFilePath = path.join(__dirname, '..', normalizedRelativePath);
      if (fs.existsSync(existingFilePath)) {
        fs.unlinkSync(existingFilePath);
      }
    }

    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    return res.json({
      message: 'Profile photo updated successfully',
      profileImage: user.profileImage,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    return res.status(500).json({ message: 'Error uploading profile photo' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// @route   GET /api/users/admin/stats
// @desc    Get platform stats for admin
// @access  Private (Admin)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [
      totalUsers,
      totalOrganizers,
      totalAdmins,
      totalResources,
      activeResources,
      draftResources,
      totalApplications,
      activeAccounts,
      inactiveAccounts,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'organizer' }),
      User.countDocuments({ role: 'admin' }),
      Resource.countDocuments({}),
      Resource.countDocuments({ status: 'active' }),
      Resource.countDocuments({ status: 'draft' }),
      Application.countDocuments({}),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isActive: false }),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalOrganizers,
        totalAdmins,
        totalResources,
        activeResources,
        draftResources,
        totalApplications,
        activeAccounts,
        inactiveAccounts,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

// @route   GET /api/users/admin/users
// @desc    List all users for admin
// @access  Private (Admin)
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await User.find({})
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort('-createdAt');

    return res.json({ users, count: users.length });
  } catch (error) {
    console.error('Admin users list error:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
});

// @route   PATCH /api/users/admin/users/:id/role
// @desc    Change user role (admin)
// @access  Private (Admin)
router.patch('/admin/users/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { role } = req.body;
    const allowedRoles = new Set(['user', 'organizer', 'admin']);
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    targetUser.role = role;
    await targetUser.save();

    const sanitized = await User.findById(targetUser._id).select('-password -passwordResetToken -passwordResetExpires');
    return res.json({ message: 'User role updated successfully', user: sanitized });
  } catch (error) {
    console.error('Admin change role error:', error);
    return res.status(500).json({ message: 'Error updating user role' });
  }
});

// @route   PATCH /api/users/admin/users/:id/status
// @desc    Activate/deactivate user account (admin)
// @access  Private (Admin)
router.patch('/admin/users/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user.id && isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    targetUser.isActive = isActive;
    await targetUser.save();

    const sanitized = await User.findById(targetUser._id).select('-password -passwordResetToken -passwordResetExpires');
    return res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user: sanitized });
  } catch (error) {
    console.error('Admin change status error:', error);
    return res.status(500).json({ message: 'Error updating user status' });
  }
});

// @route   DELETE /api/users/admin/users/:id
// @desc    Permanently delete a user account (admin)
// @access  Private (Admin)
router.delete('/admin/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.deleteOne({ _id: targetUser._id });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;