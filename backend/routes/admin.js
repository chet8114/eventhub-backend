const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.get('/dashboard', auth, requireRole('admin'), adminController.getDashboard);
router.get('/users', auth, requireRole('admin'), adminController.getUsers);
router.put('/users/:id/role', auth, requireRole('admin'), adminController.updateUserRole);
router.get('/attendance', auth, requireRole('admin'), adminController.getAttendanceLogs);
router.get('/attendance/export', auth, requireRole('admin'), adminController.exportAttendanceCSV);
router.get('/events/:id/stats', auth, requireRole('admin'), adminController.getEventStats);

module.exports = router;
