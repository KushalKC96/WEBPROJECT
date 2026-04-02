import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// USER ROUTES (Authentication Required)
// ============================================

// Create a payment (linked to a booking or rental)
// POST /api/payments
router.post('/', authenticate, paymentController.createPayment);

// Get own payment history
// GET /api/payments/my
router.get('/my', authenticate, paymentController.getUserPayments);

// Get single payment by ID
// GET /api/payments/1
router.get('/:id', authenticate, paymentController.getPaymentById);

// ============================================
// ADMIN ROUTES (Admin Only)
// ============================================

// Get all payments (filter by ?status=completed or ?method=esewa)
// GET /api/payments
router.get('/', authenticate, authorize('admin'), paymentController.getAllPayments);

export default router;
