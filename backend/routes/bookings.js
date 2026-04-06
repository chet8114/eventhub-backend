const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

router.post('/', auth, requireRole('user'), bookingController.createBooking);
router.get('/my', auth, bookingController.getMyBookings);
router.put('/:id/cancel', auth, requireRole('user'), bookingController.cancelBooking);
router.get('/:id/qr', auth, bookingController.getBookingQR);

module.exports = router;
