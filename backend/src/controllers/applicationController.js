const Application = require('../models/Application');
const Resource = require('../models/Resource');  // Assume you have a Resource model
const fs = require('fs');
const path = require('path');

// POST /api/applications - Create new application
const createApplication = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;  // From authMiddleware (secure, ignore frontend userId)
    const resourceId = req.body.resourceId;
    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;
 
    // Validation
    if (!message || !resourceId) {
      return res.status(400).json({ success: false, message: 'Message and resource ID are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume upload is required.' });
    }

    // Check if user already applied to this resource
    const existingApp = await Application.findOne({ user: userId, resource: resourceId });
    if (existingApp) {
      // Optional: Delete old resume if exists
      if (existingApp.resumePath) {
        const oldFilePath = path.join(__dirname, '../..', existingApp.resumePath);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      return res.status(400).json({ success: false, message: 'You have already applied to this resource.' });
    }

    // Create application
    const application = new Application({
      user: userId,
      resource: resourceId,
      message,
      resumePath
    });
    await application.save();

    // Increment resource's applicationsCount (populate to get resource)
    await Resource.findByIdAndUpdate(resourceId, { $inc: { applicationsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: { applicationId: application._id }
    });
  } catch (error) {
    console.error('Create Application Error:', error);
    
    // Cleanup uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '../..', `/uploads/resumes/${req.file.filename}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(500).json({ success: false, message: 'Server error during application submission.' });
  }
};

// GET /api/applications/my - Get user's applications
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const applications = await Application.find({ userId }).populate('resourceId');
    
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Get My Applications Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

module.exports = { getMyApplications, createApplication };