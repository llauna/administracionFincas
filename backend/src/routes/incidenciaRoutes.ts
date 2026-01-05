import { Router } from 'express';
import { incidenciaController } from '../controllers/incidenciaController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Todas las rutas de incidencias requieren estar logueado
router.use(authenticate);

router.get('/', incidenciaController.getAll);
router.post('/', incidenciaController.create);
router.get('/:id', incidenciaController.getById);
router.put('/:id', incidenciaController.update);

export default router;