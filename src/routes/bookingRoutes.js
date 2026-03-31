import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
<<<<<<< HEAD
=======
import {
  getAllBookings,
  getBookingById,
  getUserBookings,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js';
>>>>>>> c9e15b790b8f114bf891ac9b0df683427b7dc1fe

const router = express.Router();

<<<<<<< HEAD
// ============================================
// USER ROUTES (Authentication Required)
// ============================================

// Book a professional
// POST /api/bookings
router.post('/', authenticate, bookingController.createBooking);

// Get user's bookings
// GET /api/bookings/user/5
router.get('/user/:userId', authenticate, bookingController.getUserBookings);

// Get single booking
// GET /api/bookings/1
router.get('/:id', authenticate, bookingController.getBookingById);

// Cancel a booking
// PUT /api/bookings/1/cancel
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// ============================================
// ADMIN ROUTES (Admin Only)
// ============================================

// Get all bookings (optionally filter by ?status=pending)
// GET /api/bookings
router.get('/', authenticate, authorize('admin'), bookingController.getAllBookings);

// Update booking status
// PUT /api/bookings/1/status
router.put('/:id/status', authenticate, authorize('admin'), bookingController.updateBookingStatus);
=======
router.get('/', authenticate, authorize('admin'), getAllBookings);
router.get('/user/:userId', authenticate, authorize('user', 'admin'), getUserBookings);
router.get('/:id', authenticate, authorize('user', 'professional', 'admin'), getBookingById);
router.post('/', authenticate, authorize('user', 'admin'), createBooking);
router.put('/:id/cancel', authenticate, authorize('user', 'admin'), cancelBooking);
router.put('/:id/status', authenticate, authorize('professional', 'admin'), updateBookingStatus);
router.delete('/:id', authenticate, authorize('user', 'professional', 'admin'), deleteBooking);
>>>>>>> c9e15b790b8f114bf891ac9b0df683427b7dc1fe

export default router;
