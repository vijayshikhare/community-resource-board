// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resource = require('../models/Resource');
const Application = require('../models/Application');
const auth = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

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
// @desc    Upload profile photo (base64 to database)
// @access  Private
router.put('/profile/photo', auth, async (req, res) => {
  try {
    const { profilePhoto } = req.body;

    if (!profilePhoto || typeof profilePhoto !== 'string') {
      return res.status(400).json({ message: 'Profile photo data is required' });
    }

    // Validate base64 format (should start with data:image/)
    if (!profilePhoto.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store base64 directly in database
    user.profileImage = profilePhoto;
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

// @route   POST /api/users/admin/create-admin
// @desc    Create new admin account (admin-only, for backend/manual use)
// @access  Private (Admin only)
router.post('/admin/create-admin', auth, async (req, res) => {
  try {
    // Only existing admins can create other admins
    if (req.user.role !== 'admin') {
      console.warn(`[SECURITY] Non-admin user ${req.user.id} attempted to create admin account`);
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create admin user
    const newAdmin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: `admin-${Date.now()}`,
      password,
      role: 'admin',
    });

    await newAdmin.save();

    // Audit log
    console.log(`[ADMIN_AUDIT] Admin ${req.user.id} created new admin account: ${newAdmin._id}`);

    const sanitized = await User.findById(newAdmin._id).select('-password -passwordResetToken -passwordResetExpires');
    return res.status(201).json({
      message: 'Admin account created successfully',
      user: sanitized,
    });
  } catch (error) {
    console.error('[ADMIN_ERROR] Create admin error:', error);
    return res.status(500).json({ message: 'Error creating admin account' });
  }
});

// @route   GET /api/users/admin/stats
// @desc    Get platform stats for admin
// @access  Private (Admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.warn(`[SECURITY] Non-admin user ${req.user.id} attempted to access admin stats`);
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
// @access  Private (Admin only)
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.warn(`[SECURITY] Non-admin user ${req.user.id} attempted to list admin users`);
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
// @access  Private (Admin only)
router.patch('/admin/users/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.warn(`[SECURITY] Non-admin user ${req.user.id} attempted to change user role`);
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
// @access  Private (Admin only)
router.patch('/admin/users/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.warn(`[SECURITY] Non-admin user ${req.user.id} attempted to change user status`);
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