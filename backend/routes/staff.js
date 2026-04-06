const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.post('/scan', auth, requireRole('staff'), staffController.scanQR);
router.get('/history', auth, requireRole('staff'), staffController.getScanHistory);

module.exports = router;
