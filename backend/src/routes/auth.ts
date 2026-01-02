import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// Registro de usuario
router.post('/register', async (req: Request, res: Response) => {
    try {
        const {
            username,
            email,
            password,
            role,
            nombreCompleto,
            puesto,
            departamento,
            fechaContratacion,
            telefono,
            direccion
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: IUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            nombreCompleto,
            puesto,
            departamento,
            fechaContratacion,
            telefono,
            direccion
        });

        await newUser.save();

        res.status(201).json({ message: `Usuario ${newUser.nombreCompleto} registrado con éxito` });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario', details: error });
    }
});

// Login de usuario
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log('Intento de login para:', email);


        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!password) {
            return res.status(400).json({ error: 'La contraseña es requerida' });
        }

        console.log('User found:', {
            email: user.email,
            hasPassword: !!user.password,
            inputPassword: !!password
        });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            console.log('Password comparison failed for user:', user.email);
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está definido');
            return res.status(500).json({ error: 'Error de configuración del servidor' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.lastLogin = new Date();
        await user.save();

        // Crear objeto de usuario para la respuesta (sin la contraseña)
        const userResponse = {
            _id: user._id,
            email: user.email,
            role: user.role,
            tipo: user.role, // Asumiendo que 'role' es equivalente a 'tipo' en el frontend
            nombreCompleto: user.nombreCompleto,
            puesto: user.puesto,
            departamento: user.departamento
            // Añade aquí cualquier otro campo que necesites en el frontend
        };

        res.json({
            message: `Bienvenido ${user.nombreCompleto}`,
            token,
            user: userResponse // Añadimos el objeto de usuario a la respuesta
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            details: error instanceof Error ? error.message : 'Error desconocido' });
    }
});

// Ruta protegida de ejemplo
router.get('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId; // Asumiendo que tienes middleware que añade userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            nombreCompleto: user.nombreCompleto,
            email: user.email,
            role: user.role,
            puesto: user.puesto,
            departamento: user.departamento,
            fechaContratacion: user.fechaContratacion,
            telefono: user.telefono,
            direccion: user.direccion
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil', details: error });
    }
});

router.get('/validar-token', authenticate, async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) return res.status(404).json({ valid: false });
    res.json({ valid: true, user });
});


export default router;
