import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

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

export default router;
