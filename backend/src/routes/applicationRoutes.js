// backend/src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getMyApplications, createApplication } = require('../controllers/applicationController');

// Get logged-in user's applications
router.get('/my', authMiddleware, getMyApplications);

// Create application (already exists)
router.post('/', authMiddleware, createApplication);

module.exports = router;
