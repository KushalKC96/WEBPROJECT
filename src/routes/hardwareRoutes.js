import express from 'express';
import * as hardwareController from '../controllers/hardwareController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTES
router.get('/', hardwareController.getAllHardware);
router.get('/:id', hardwareController.getHardwareById);

// ADMIN ROUTES
router.post('/', authenticate, authorize('admin'), hardwareController.createHardware);
router.put('/:id', authenticate, authorize('admin'), hardwareController.updateHardware);
router.delete('/:id', authenticate, authorize('admin'), hardwareController.deleteHardware);

export default router;