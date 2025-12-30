import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { authorizeAdmin } from '../middleware/adminMiddleware';
import {getTodosLosUsuarios} from "../controllers/empleadoController";

const router = Router();

/**
 * === LISTAR TODOS LOS USUARIOS ===
 * Solo accesible para admin
 */
router.get('/', authenticate, authorizeAdmin, getTodosLosUsuarios);

/**
 * === OBTENER USUARIO POR ID ===
 * Solo accesible para admin
 */
router.get('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

/**
 * === CREAR USUARIO ===
 * Solo accesible para admin
 */
router.post('/', authenticate, authorizeAdmin, async (req: AuthRequest, res: Response) => {
    try {

        console.log("📩 Datos recibidos en POST /api/users:", req.body);

        const { username, nombreCompleto, email, password, role, puesto, departamento, fechaContratacion, telefono, direccion, tipo } = req.body;

        // Validar campos requeridos
        if (!username || !nombreCompleto || !email || !password || !puesto || !departamento || !fechaContratacion) {
            return res.status(400).json({ mensaje: 'Todos los campos obligatorios deben ser completados' });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const newUser: IUser = new User({
            username,
            nombreCompleto,
            email,
            password: hashedPassword,
            role: role || 'viewer',
            tipo: tipo || 'usuario',
            puesto,
            departamento,
            fechaContratacion,
            telefono,
            direccion
        });

        await newUser.save();
        console.log("✅ Usuario creado:", newUser);
        res.status(201).json({ mensaje: 'Usuario creado correctamente', user: newUser });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

/**
 * === ACTUALIZAR USUARIO ===
 * Solo accesible para admin
 */
router.put('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

/**
 * === ELIMINAR USUARIO ===
 * Solo accesible para admin
 */
router.delete('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

export default router;
