const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const auth = require('../middlewares/auth');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const typeMap = {
  training: 'Training',
  workshop: 'Workshop',
  internship: 'Internship',
  job: 'Job',
  scholarship: 'Scholarship',
  event: 'Event',
  course: 'Course',
  other: 'Other',
};

const categoryMap = {
  technology: 'Technology',
  business: 'Business',
  design: 'Design',
  marketing: 'Marketing',
  health: 'Health',
  education: 'Education',
  other: 'Other',
};

const locationTypeMap = {
  remote: 'Remote',
  online: 'Remote',
  onsite: 'On-site',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
};

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeEnum = (value, map, fallback) => {
  if (!value) return fallback;
  const normalized = map[String(value).trim().toLowerCase()];
  return normalized || fallback;
};

const parsePagination = (query) => {
  const page = Math.max(DEFAULT_PAGE, Number.parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
};

const normalizeStatusFilter = (statusValue) => {
  if (!statusValue) {
    // User-facing default: show published resources (active + closed), hide drafts.
    return { $in: ['active', 'closed'] };
  }

  const normalized = String(statusValue).trim().toLowerCase();
  if (normalized === 'all') return null;
  if (['active', 'closed', 'draft'].includes(normalized)) return normalized;
  return { $in: ['active', 'closed'] };
};

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/my', auth, async (req, res) => {
  try {
    if (!['organizer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resources = await Resource.find({ organizer: req.user.id })
      .populate('organizer', 'name email')
      .sort('-createdAt');

    return res.json({ resources, count: resources.length });
  } catch (error) {
    console.error('Fetch my resources error:', error.message);
    return res.status(500).json({ message: 'Error fetching your resources' });
  }
});

router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const resources = await Resource.find({})
      .populate('organizer', 'name email role isActive')
      .sort('-createdAt');

    return res.json({ resources, count: resources.length });
  } catch (error) {
    console.error('Fetch admin resources error:', error.message);
    return res.status(500).json({ message: 'Error fetching resources' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { type, category, search, status, featured, location } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const query = {};
    const statusFilter = normalizeStatusFilter(status);
    if (statusFilter) {
      query.status = statusFilter;
    }

    query['policyEnforcement.isTerminated'] = { $ne: true };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { type: searchRegex },
        { organizerName: searchRegex },
        { category: searchRegex },
      ];
    }

    if (type) {
      query.type = normalizeEnum(type, typeMap, type);
    }

    if (category) {
      query.category = normalizeEnum(category, categoryMap, category);
    }

    if (location) {
      const locationRegex = new RegExp(escapeRegex(location), 'i');
      query.$or = (query.$or || []).concat([
        { 'location.type': locationRegex },
        { 'location.address': locationRegex },
        { 'location.city': locationRegex },
        { 'location.country': locationRegex },
      ]);
    }

    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    const allowedSorts = new Set(['createdAt', '-createdAt', 'views', '-views', 'startDate', '-startDate']);
    const sort = allowedSorts.has(req.query.sort) ? req.query.sort : '-createdAt';

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('organizer', 'name email')
        .sort(sort)
        .limit(limit)
        .skip(skip),
      Resource.countDocuments(query),
    ]);

    return res.json({
      resources,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Fetch resources error:', error.message);
    return res.status(500).json({ message: 'Error fetching resources' });
  }
});

router.patch('/:id/terminate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can terminate resources' });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const reason = String(req.body?.reason || '').trim();
    if (!reason) {
      return res.status(400).json({ message: 'Termination reason is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.policyEnforcement?.isTerminated) {
      return res.status(400).json({ message: 'Resource is already terminated' });
    }

    resource.policyEnforcement = {
      ...(resource.policyEnforcement || {}),
      isTerminated: true,
      terminationReason: reason,
      terminatedAt: new Date(),
      terminatedBy: req.user.id,
      lastStatusBeforeTermination: resource.status || 'active',
      organizerAppeal: {
        ...(resource.policyEnforcement?.organizerAppeal || {}),
        status: 'none',
        reason: '',
        submittedAt: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
        adminResponse: '',
      },
    };

    resource.status = 'closed';
    await resource.save();

    return res.json({ message: 'Resource terminated successfully', resource });
  } catch (error) {
    console.error('Terminate resource error:', error.message);
    return res.status(500).json({ message: 'Error terminating resource' });
  }
});

router.patch('/:id/appeal', auth, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can submit appeals' });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const reason = String(req.body?.reason || '').trim();
    if (!reason) {
      return res.status(400).json({ message: 'Appeal reason is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only appeal your own resources' });
    }

    if (!resource.policyEnforcement?.isTerminated) {
      return res.status(400).json({ message: 'Only terminated resources can be appealed' });
    }

    resource.policyEnforcement = {
      ...(resource.policyEnforcement || {}),
      organizerAppeal: {
        ...(resource.policyEnforcement?.organizerAppeal || {}),
        status: 'pending',
        reason,
        submittedAt: new Date(),
        reviewedAt: undefined,
        reviewedBy: undefined,
        adminResponse: '',
      },
    };

    await resource.save();
    return res.json({ message: 'Appeal submitted successfully', resource });
  } catch (error) {
    console.error('Appeal resource error:', error.message);
    return res.status(500).json({ message: 'Error submitting appeal' });
  }
});

router.patch('/:id/reissue', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can reissue resources' });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const adminResponse = String(req.body?.adminResponse || '').trim();

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.policyEnforcement?.isTerminated) {
      return res.status(400).json({ message: 'Resource is not terminated' });
    }

    resource.status = resource.policyEnforcement?.lastStatusBeforeTermination || 'active';
    resource.policyEnforcement = {
      ...(resource.policyEnforcement || {}),
      isTerminated: false,
      terminationReason: '',
      terminatedAt: undefined,
      terminatedBy: undefined,
      organizerAppeal: {
        ...(resource.policyEnforcement?.organizerAppeal || {}),
        status: 'accepted',
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        adminResponse: adminResponse || 'Resource reissued after review.',
      },
    };

    await resource.save();
    return res.json({ message: 'Resource reissued successfully', resource });
  } catch (error) {
    console.error('Reissue resource error:', error.message);
    return res.status(500).json({ message: 'Error reissuing resource' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const resources = await Resource.find({ status: 'active', featured: true })
      .populate('organizer', 'name email')
      .sort('-createdAt')
      .limit(6);

    return res.json({ resources, count: resources.length });
  } catch (error) {
    console.error('Fetch featured resources error:', error.message);
    return res.status(500).json({ message: 'Error fetching featured resources' });
  }
});

router.get('/organizer/my', auth, async (req, res) => {
  try {
    if (!['organizer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only organizers can access this route' });
    }

    const resources = await Resource.find({ organizer: req.user.id }).sort('-createdAt');
    return res.json({ resources, count: resources.length });
  } catch (error) {
    console.error('Fetch organizer resources error:', error.message);
    return res.status(500).json({ message: 'Error fetching resources' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const resource = await Resource.findById(req.params.id).populate('organizer', 'name email phone');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await Resource.updateOne({ _id: resource._id }, { $inc: { views: 1 } });

    return res.json({ resource: { ...resource.toObject(), views: resource.views + 1 } });
  } catch (error) {
    console.error('Fetch resource error:', error.message);
    return res.status(500).json({ message: 'Error fetching resource' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!['organizer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only organizers can create resources' });
    }

    const {
      title,
      description,
      type,
      category,
      duration,
      capacity,
      startDate,
      endDate,
      location,
      mode,
      prerequisites,
      benefits,
      deadline,
      requirements,
      skills,
      tags,
      featured = false,
      imageUrl,
      contactEmail,
      contactPhone,
      website,
      status = 'active',
    } = req.body;

    if (!title || !description || !category || !duration || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid startDate or endDate' });
    }

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'startDate must be before endDate' });
    }

    const maxParticipants = Number.parseInt(capacity, 10);
    if (Number.isNaN(maxParticipants) || maxParticipants <= 0) {
      return res.status(400).json({ success: false, message: 'Capacity must be a positive integer' });
    }

    const normalizedType = normalizeEnum(type || 'Training', typeMap, 'Training');
    const normalizedCategory = normalizeEnum(category, categoryMap, 'Other');
    const normalizedMode = normalizeEnum(mode || 'Remote', locationTypeMap, 'Remote');

    const locationObj = typeof location === 'object' && location !== null
      ? { ...location, type: normalizeEnum(location.type || mode || 'Remote', locationTypeMap, 'Remote') }
      : { type: normalizedMode, address: location ? String(location).trim() : '' };

    const normalizedStatus = ['active', 'draft', 'closed'].includes(String(status || '').toLowerCase())
      ? String(status).toLowerCase()
      : 'active';

    const resource = new Resource({
      title: String(title).trim(),
      description: String(description).trim(),
      type: normalizedType,
      category: normalizedCategory,
      duration: String(duration).trim(),
      maxParticipants,
      startDate: start,
      endDate: end,
      deadline: deadline ? new Date(deadline) : undefined,
      location: locationObj,
      requirements: toArray(requirements).concat(toArray(prerequisites)),
      benefits: toArray(benefits),
      skills: toArray(skills),
      status: normalizedStatus,
      featured: Boolean(featured),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      contactEmail: contactEmail ? String(contactEmail).trim() : '',
      contactPhone: contactPhone ? String(contactPhone).trim() : '',
      website: website ? String(website).trim() : '',
      tags: toArray(tags),
      organizer: req.user.id,
      organizerName: req.user.name || 'Organizer',
    });

    await resource.save();
    return res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error('Create resource error:', error.message);
    return res.status(500).json({ success: false, message: 'Error creating resource' });
  }
});

const updateResource = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    Object.assign(resource, req.body);
    await resource.save();

    return res.json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    console.error('Update resource error:', error.message);
    return res.status(500).json({ message: 'Error updating resource' });
  }
};

router.put('/:id', auth, updateResource);
router.patch('/:id', auth, updateResource);

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();
    return res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error.message);
    return res.status(500).json({ message: 'Error deleting resource' });
  }
});

module.exports = router;
