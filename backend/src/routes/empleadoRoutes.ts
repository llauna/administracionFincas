import { Router } from 'express';
import { getEmpleados, createEmpleado } from '../controllers/empleadoController';
// Importa tus middlewares de autenticación si los tienes
// import { authMiddleware } from '../middleware/auth';

const router = Router();

// Define las rutas
router.get('/', getEmpleados);
router.post('/', createEmpleado);

export default router;