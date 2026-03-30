<<<<<<< HEAD
import express from 'express';
import * as professionalController from '../controllers/professionalController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────
// PUBLIC ROUTES (no login needed)
// ─────────────────────────────────────────
router.get('/', professionalController.getAllProfessionals);          // GET all
router.get('/skill/:skill', professionalController.getProfessionalsBySkill); // GET by skill  ← must be BEFORE /:id
router.get('/:id', professionalController.getProfessionalById);       // GET single

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES (login + admin role needed)
// ─────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), professionalController.createProfessional);     // ADD new
router.delete('/:id', authenticate, authorize('admin'), professionalController.deleteProfessional); // DELETE

export default router;
=======
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getAllProfessionals,
  searchProfessionals,
  getProfessionalById,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  getMyBookings,
  adminGetAllProfessionals,
  adminCreateProfessional,
  adminUpdateProfessional,
  adminDeleteProfessional
} from '../controllers/professionalController.js';

const router = Router();

// ─────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────
router.get('/', getAllProfessionals);
router.get('/search', searchProfessionals);

// ─────────────────────────────────────────────
// PROFESSIONAL (self)  –  order matters: /me before /:id
// ─────────────────────────────────────────────
router.get('/me', authenticate, authorize('professional'), getMyProfile);
router.put('/me', authenticate, authorize('professional'), updateMyProfile);
router.patch('/me/availability', authenticate, authorize('professional'), updateMyAvailability);
router.get('/me/bookings', authenticate, authorize('professional'), getMyBookings);

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────
router.get('/admin/all', authenticate, authorize('admin'), adminGetAllProfessionals);
router.post('/admin', authenticate, authorize('admin'), adminCreateProfessional);
router.put('/admin/:id', authenticate, authorize('admin'), adminUpdateProfessional);
router.delete('/admin/:id', authenticate, authorize('admin'), adminDeleteProfessional);

// ─────────────────────────────────────────────
// PUBLIC (parameterized — must come last)
// ─────────────────────────────────────────────
router.get('/:id', getProfessionalById);

export default router;
>>>>>>> ea100e653a6180d720fc96e391acbc22ade5b8b5
