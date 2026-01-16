import { Router } from 'express';
import {
    getResumenTesoreria,
    realizarAjusteSaldo,
    realizarTransferencia,
    crearBanco,
    crearCaja
} from '../controllers/tesoreriaController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/resumen', authenticate, getResumenTesoreria);
router.post('/ajuste', authenticate, realizarAjusteSaldo);
router.post('/transferencia', authenticate, realizarTransferencia);

// NUEVAS RUTAS DE CREACIÓN
router.post('/bancos', authenticate, crearBanco);
router.post('/cajas', authenticate, crearCaja);

export default router;