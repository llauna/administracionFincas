// Ruta: C:\Users\0019592\WorkSpace\WS_ReactJS\administracionFincas\backend\src\routes\propietarioRoutes.ts
import { Router } from 'express';
import {
    getPropietarios,
    getPropietarioById,
    createPropietario,
    updatePropietario,
    deletePropietario
} from '../controllers/propietarioController';

const router = Router();

// Rutas para propietarios
router.get('/', getPropietarios);
router.get('/:id', getPropietarioById);
router.post('/', createPropietario);
router.put('/:id', updatePropietario);
router.delete('/:id', deletePropietario);

export default router;