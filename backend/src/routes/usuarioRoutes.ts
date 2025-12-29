import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController';
// import { auth } from '../middleware/auth'; // Si necesitas autenticación

const router = Router();

// Aplicar middleware de autenticación si es necesario
//router.use(auth);

router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

export default router;