// src/controllers/resourceController.js

const Resource = require('../models/Resource');

// -------------------------------
// Helper: Consistent Error Handling
// -------------------------------
const handleError = (res, error, status = 500) => {
  console.error(error);
  return res.status(status).json({
    success: false,
    message: error.message || 'Server error',
  });
};

// -------------------------------
// GET all active resources (Public)
// -------------------------------
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ status: 'active' })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, resources });
  } catch (error) {
    return handleError(res, error);
  }
};

// -------------------------------
// GET resources created by logged-in user (Private)
// -------------------------------
const getMyResources = async (req, res) => {
  try {
    const userId = req.user.id;

    const resources = await Resource.find({ createdBy: userId })
      .sort({ createdAt: -1 });

    return res.json({ success: true, resources });
  } catch (error) {
    return handleError(res, error);
  }
};

// -------------------------------
// GET single resource by ID (Public)
// -------------------------------
const getResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id)
      .populate('createdBy', 'username email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    return res.json({ success: true, resource });
  } catch (error) {
    return handleError(res, error, 404);
  }
};

// -------------------------------
// CREATE new resource (Private)
// -------------------------------
const createResource = async (req, res) => {
  try {
    const { title, description, category, contactInfo, location } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    const newResource = await Resource.create({
      title,
      description,
      category,
      contactInfo,
      location,
      createdBy: userId,
      status: 'active',
    });

    return res.status(201).json({ success: true, resource: newResource });
  } catch (error) {
    return handleError(res, error, 400);
  }
};

// -------------------------------
// UPDATE existing resource (Private)
// -------------------------------
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, contactInfo, location } = req.body;
    const userId = req.user.id;

    const resource = await Resource.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { title, description, category, contactInfo, location },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found or unauthorized',
      });
    }

    return res.json({ success: true, resource });
  } catch (error) {
    return handleError(res, error, 400);
  }
};

// -------------------------------
// DELETE resource (Private)
// -------------------------------
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await Resource.findOneAndDelete({ _id: id, createdBy: userId });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found or unauthorized',
      });
    }

    return res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    return handleError(res, error);
  }
};

// -------------------------------
// Export Controller Functions
// -------------------------------
module.exports = {
  getResources,
  getMyResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
};
