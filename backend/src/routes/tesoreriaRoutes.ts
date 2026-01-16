import { Router } from 'express';
import { getResumenTesoreria } from '../controllers/tesoreriaController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/tesoreria/resumen
 * @desc    Obtiene el listado de bancos, cajas y totales (global o por comunidad)
 * @access  Privado (Admin/Empleado)
 */
router.get('/resumen', authenticate, getResumenTesoreria);

export default router;