import { Router } from 'express';
import {
    registrarGastoComunidad,
    getAllProveedores,
    createProveedor
} from '../controllers/proveedorController';

const router = Router();

// Rutas base para /api/proveedores
router.get('/', getAllProveedores);
router.post('/', createProveedor);

// Ruta específica para el reparto
router.post('/registrar-gasto', registrarGastoComunidad);

export default router;