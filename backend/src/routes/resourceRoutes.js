const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');  // Your Resource model

// GET /api/resources - Public: Fetch all active resources (no auth needed)
router.get('/', async (req, res) => {
  try {
    // Optional: Query params for filtering (e.g., ?category=leadership)
    const { category, limit = 10 } = req.query;
    const query = { status: 'active' };  // Only show active resources
    if (category) query.category = category;

    const resources = await Resource.find(query)
      .select('title description category organizerName link status applicationsCount')  // Select needed fields
      .sort({ createdAt: -1 })  // Newest first
      .limit(parseInt(limit))
      .populate('organizer', 'name');  // Populate organizer name

    res.json({ success: true, resources });  // Frontend expects { resources: [...] }
  } catch (error) {
    console.error('Get Resources Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resources.' });
  }
});

// Optional: GET /api/resources/:id - For ResourceDetail (add auth if needed)
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('organizer', 'name');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    res.json({ success: true, resource });
  } catch (error) {
    console.error('Get Resource Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resource.' });
  }
});

module.exports = router;