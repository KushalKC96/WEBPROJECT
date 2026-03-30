import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { createRental, getUserRentals, getRentalById, returnRental } from '../controllers/rentalController.js';

const router = Router();

router.post('/', authenticate, createRental);
router.get('/user/:userId', authenticate, getUserRentals);
router.get('/:id', authenticate, getRentalById);
router.put('/:id/return', authenticate, returnRental);

export default router;
