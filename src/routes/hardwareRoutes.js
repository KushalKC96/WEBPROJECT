import { Router } from 'express';
import { getAllHardware, getHardwareById } from '../controllers/hardwareController.js';

const router = Router();

router.get('/', getAllHardware);
router.get('/:id', getHardwareById);

export default router;
