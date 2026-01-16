import { Router } from 'express';
import { getResumenTesoreria } from '../controllers/tesoreriaController';
import Movimiento from '../models/Movimiento';
import { authenticate } from '../middleware/authMiddleware';
import {
    registrarGasto,
    getMovimientosPorProveedor,
    deleteMovimientosAgrupados,
    getByComunidadAndYear
} from '../controllers/movimientoController';

const router = Router();


// 1. Obtener movimientos por comunidad (definida directamente aquí)
router.get('/comunidad/:comunidadId', async (req, res) => {
    try {
        const movimientos = await Movimiento.find({ comunidad: req.params.comunidadId })
            .populate('propiedad', 'piso puerta referencia')
            .sort({ fecha: -1 });
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener movimientos' });
    }
});

// 2. Rutas que usan las funciones importadas del controlador
// NOTA: Usamos las funciones directamente, sin "movimientoController." ni "controller."
router.get('/proveedor/:proveedorId', authenticate, getMovimientosPorProveedor);
router.delete('/bulk-delete', authenticate, deleteMovimientosAgrupados);

router.post('/registrar-gasto', (req, res, next) => {
    console.log("➡️ Intentando acceder a /api/movimientos/registrar-gasto");
    next();
}, registrarGasto);

// 3. Ruta corregida para Estados Financieros (añadido ':' a comunidadId)
router.get('/comunidad/:comunidadId/year/:year', getByComunidadAndYear);

export default router;