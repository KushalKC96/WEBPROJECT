import express from 'express';
import * as rentalController from '../controllers/rentalController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// USER ROUTES (Authentication Required)
// ============================================

// Create rental booking
// POST /api/rentals
router.post('/', authenticate, rentalController.createRental);

// Get user's rentals
// GET /api/rentals/user/5
router.get('/user/:userId', authenticate, rentalController.getUserRentals);

// Get single rental
// GET /api/rentals/1
router.get('/:id', authenticate, rentalController.getRentalById);

// Return rental
// PUT /api/rentals/1/return
router.put('/:id/return', authenticate, rentalController.returnRental);

// ============================================
// ADMIN ROUTES (Admin Only)
// ============================================

// Get all rentals
// GET /api/rentals
router.get('/', authenticate, authorize('admin'), rentalController.getAllRentals);

// Update rental status
// PUT /api/rentals/1/status
router.put('/:id/status', authenticate, authorize('admin'), rentalController.updateRentalStatus);

export default router;