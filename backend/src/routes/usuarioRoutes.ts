import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController';
import { changePassword, updatePerfil } from '../controllers/usuarioController';
import { authenticate } from '../middleware/authMiddleware';
// import { auth } from '../middleware/auth'; // Si necesitas autenticación

const router = Router();

// Aplicar middleware de autenticación si es necesario
//router.use(auth);

router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);
router.post('/:id/change-password', authenticate, changePassword);
router.put('/:id/perfil', authenticate, updatePerfil);

export default router;