<<<<<<< HEAD
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
=======
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getAllHardware, getHardwareById, createHardware, updateHardware, deleteHardware } from '../controllers/hardwareController.js';

const router = Router();

router.get('/', getAllHardware);
router.get('/:id', getHardwareById);
router.post('/', authenticate, authorize('admin'), createHardware);
router.put('/:id', authenticate, authorize('admin'), updateHardware);
router.delete('/:id', authenticate, authorize('admin'), deleteHardware);

export default router;
>>>>>>> ea100e653a6180d720fc96e391acbc22ade5b8b5
