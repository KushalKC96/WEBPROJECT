<<<<<<< HEAD
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
=======
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { createRental, getUserRentals, getRentalById, returnRental, getAllRentals, updateRentalStatus } from '../controllers/rentalController.js';

const router = Router();

router.post('/', authenticate, createRental);
router.get('/user/:userId', authenticate, getUserRentals);
router.put('/:id/return', authenticate, returnRental);
router.put('/:id/status', authenticate, authorize('admin'), updateRentalStatus);
router.get('/', authenticate, authorize('admin'), getAllRentals);
router.get('/:id', authenticate, getRentalById);

export default router;
>>>>>>> ea100e653a6180d720fc96e391acbc22ade5b8b5
