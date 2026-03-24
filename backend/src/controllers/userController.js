// src/controllers/userController.js
const User = require('../models/User'); // make sure User model exists

// Update user profile
const updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id; // from auth middleware
    const updatedData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

module.exports = { updateUser };
