const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Resource = require('../models/Resource');
const auth = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { sendMail } = require('../utils/mailer');

const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.pdf', '.doc', '.docx'];

    if (allowedExt.includes(ext) && allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  },
});

const toPublicResumeUrl = (resume) => {
  if (!resume) return '';

  if (typeof resume === 'string') {
    if (resume.startsWith('/uploads/')) return resume;
    return '';
  }

  if (typeof resume.path === 'string' && resume.path.startsWith('/uploads/')) {
    return resume.path;
  }

  if (typeof resume.filename === 'string' && resume.filename.trim()) {
    return `/uploads/resumes/${resume.filename.trim()}`;
  }

  return '';
};

const serializeApplication = (applicationDoc) => {
  const application = applicationDoc?.toObject ? applicationDoc.toObject() : applicationDoc;
  if (!application) return application;

  return {
    ...application,
    resumeUrl: toPublicResumeUrl(application.resume),
  };
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can submit applications' });
    }

    const { resourceId, coverLetter, phone, skills } = req.body;

    if (!coverLetter || !phone) {
      return res.status(400).json({ message: 'coverLetter and phone are required' });
    }

    if (!resourceId || !isValidObjectId(resourceId)) {
      return res.status(400).json({ message: 'Valid resourceId is required' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const existingApplication = await Application.findOne({
      user: req.user.id,
      resource: resourceId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this resource' });
    }

    const application = new Application({
      user: req.user.id,
      resource: resourceId,
      coverLetter: (coverLetter || '').trim(),
      phone: (phone || '').trim(),
      skills: skills ? String(skills).split(',').map((s) => s.trim()).filter(Boolean) : [],
      resume: req.file
        ? {
          filename: req.file.filename,
          path: `/uploads/resumes/${req.file.filename}`,
          diskPath: req.file.path,
          originalName: req.file.originalname,
        }
        : undefined,
    });

    await application.save();
    await application.populate('user', 'name email').populate('resource', 'title organizer organizerName contactEmail');

    if (application.resource?.contactEmail) {
      void sendMail({
        to: application.resource.contactEmail,
        subject: `New application for ${application.resource.title}`,
        text: `${application.user.name} has applied for ${application.resource.title}.`,
      });
    }

    if (application.user?.email) {
      void sendMail({
        to: application.user.email,
        subject: `Application received: ${application.resource?.title || 'Resource'}`,
        text: `Your application has been submitted successfully and is now pending review.`,
      });
    }

    return res.status(201).json({
      message: 'Application submitted successfully',
      application: serializeApplication(application),
    });
  } catch (error) {
    console.error('Application submission error:', error.message);
    return res.status(500).json({ message: 'Error submitting application' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('resource', 'title description type location organizer')
      .sort('-createdAt');

    return res.json({ applications: applications.map(serializeApplication), count: applications.length });
  } catch (error) {
    console.error('Fetch applications error:', error.message);
    return res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can view resource applications' });
    }

    if (!isValidObjectId(req.params.resourceId)) {
      return res.status(400).json({ message: 'Invalid resource id' });
    }

    const resource = await Resource.findById(req.params.resourceId).select('organizer');
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (req.user.role !== 'admin' && resource.organizer?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view applications for this resource' });
    }

    const applications = await Application.find({ resource: req.params.resourceId })
      .populate('user', 'name email phone')
      .sort('-createdAt');

    return res.json({ applications: applications.map(serializeApplication), count: applications.length });
  } catch (error) {
    console.error('Fetch resource applications error:', error.message);
    return res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.get('/organizer', auth, async (req, res) => {
  try {
    if (!['organizer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only organizers can view applications' });
    }

    const resourceQuery = req.user.role === 'admin' ? {} : { organizer: req.user.id };
    const resources = await Resource.find(resourceQuery).select('_id');
    const resourceIds = resources.map((resource) => resource._id);

    if (req.user.role !== 'admin' && resourceIds.length === 0) {
      return res.json({ applications: [], count: 0 });
    }

    const query = { resource: { $in: resourceIds } };
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.resourceId) {
      if (!isValidObjectId(req.query.resourceId)) {
        return res.status(400).json({ message: 'Invalid resourceId filter' });
      }

      const requestedId = String(req.query.resourceId);
      const allowedIdSet = new Set(resourceIds.map((rid) => rid.toString()));

      if (req.user.role !== 'admin' && !allowedIdSet.has(requestedId)) {
        return res.status(403).json({ message: 'Not authorized to view applications for this resource' });
      }

      query.resource = requestedId;
    }

    const applications = await Application.find(query)
      .populate('user', 'name email phone')
      .populate('resource', 'title organizer')
      .sort('-createdAt');

    return res.json({ applications: applications.map(serializeApplication), count: applications.length });
  } catch (error) {
    console.error('Fetch organizer applications error:', error.message);
    return res.status(500).json({ message: 'Error fetching organizer applications' });
  }
});

router.get('/:id([0-9a-fA-F]{24})', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('resource', 'title description organizer');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isOwner = application.user?._id?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isOwningOrganizer =
      req.user.role === 'organizer' && application.resource?.organizer?.toString() === req.user.id;

    if (!isOwner && !isAdmin && !isOwningOrganizer) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    return res.json({ application: serializeApplication(application) });
  } catch (error) {
    console.error('Fetch application error:', error.message);
    return res.status(500).json({ message: 'Error fetching application' });
  }
});

router.patch('/:id([0-9a-fA-F]{24})/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const application = await Application.findById(req.params.id).populate('resource', 'organizer');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only the resource organizer can update application status' });
    }

    if (application.resource?.organizer && application.resource.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    const populated = await Application.findById(application._id)
      .populate('user', 'name email')
      .populate('resource', 'title');

    if (populated?.user?.email) {
      void sendMail({
        to: populated.user.email,
        subject: `Application status updated: ${populated.resource?.title || 'Resource'}`,
        text: `Hi ${populated.user.name}, your application status is now ${status}.`,
      });
    }

    return res.json({ message: 'Application status updated', application: serializeApplication(application) });
  } catch (error) {
    console.error('Update status error:', error.message);
    return res.status(500).json({ message: 'Error updating application status' });
  }
});

router.delete('/:id([0-9a-fA-F]{24})', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    const resumeDiskPath = application.resume?.diskPath || application.resume?.path;
    if (resumeDiskPath && fs.existsSync(resumeDiskPath)) {
      fs.unlinkSync(resumeDiskPath);
    }

    await application.deleteOne();
    return res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Delete application error:', error.message);
    return res.status(500).json({ message: 'Error deleting application' });
  }
});

module.exports = router;
