import { Router } from 'express';
import { getResumenTesoreria } from '../controllers/tesoreriaController';
import Movimiento from '../models/Movimiento';
import { authenticate } from '../middleware/authMiddleware';
import {
    registrarGasto,
    getMovimientosPorProveedor,
    deleteMovimientosAgrupados,
    getByComunidadAndYear,
    generarFacturaServicioEmpresa
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

router.post('/factura-servicio-empresa', authenticate, generarFacturaServicioEmpresa);

router.delete('/factura-servicio-empresa', authenticate, async (req, res) => {
    try {
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({ mensaje: 'Descripción no proporcionada' });
        }

        // Usamos una búsqueda exacta o un regex escapado para evitar problemas con símbolos (€, +, etc.)
        const resultado = await Movimiento.deleteMany({
            descripcion: descripcion.trim()
        });

        if (resultado.deletedCount === 0) {
            // Si no borra nada por nombre exacto, intentamos con regex flexible como respaldo
            const resultadoRegex = await Movimiento.deleteMany({
                descripcion: { $regex: descripcion.split(':')[0], $options: 'i' }
            });
            return res.json({ mensaje: `Eliminados ${resultadoRegex.deletedCount} registros por búsqueda flexible.` });
        }

        res.json({ mensaje: `Eliminados ${resultado.deletedCount} registros correctamente.` });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al eliminar factura', error: error.message });
    }
});

// 3. Ruta corregida para Estados Financieros (añadido ':' a comunidadId)
router.get('/comunidad/:comunidadId/year/:year', getByComunidadAndYear);

export default router;