import { Router } from 'express';
import Movimiento from '../models/Movimiento';
import { authenticate } from '../middleware/authMiddleware';
import * as movimientoController from '../controllers/movimientoController';

const router = Router();

// Obtener movimientos por comunidad
router.get('/comunidad/:comunidadId', async (req, res) => {
    try {
        const movimientos = await Movimiento.find({ comunidad: req.params.comunidadId })
            .populate('propiedad', 'piso puerta referencia')
            .sort({ fecha: -1 }); // Ordenar por fecha más reciente
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener movimientos' });
    }
});

router.get('/proveedor/:proveedorId', authenticate, movimientoController.getMovimientosPorProveedor);
router.delete('/bulk-delete', authenticate, movimientoController.deleteMovimientosAgrupados);
router.post('/registrar-gasto', (req, res, next) => {
    console.log("➡️ Intentando acceder a /api/movimientos/registrar-gasto");
    next();
}, movimientoController.registrarGasto);


export default router;