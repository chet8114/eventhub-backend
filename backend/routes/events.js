const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Admin routes
router.post('/', auth, requireRole('admin'), eventController.createEvent);
router.put('/:id', auth, requireRole('admin'), eventController.updateEvent);
router.delete('/:id', auth, requireRole('admin'), eventController.deleteEvent);

module.exports = router;
