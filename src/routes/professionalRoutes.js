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
