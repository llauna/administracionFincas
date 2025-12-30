import { Request, Response } from 'express';
import User from '../models/User';

export const getTodosLosUsuarios = async (req: Request, res: Response) => {
    try {
        const usuarios = await User.find({}, '-password');

        // Mapeamos en el servidor para que el frontend reciba el formato final
        const usuariosFormateados = usuarios.map(u => {
            const userObj = u.toObject();
            return {
                ...userObj,
                nombreCompleto: userObj.nombreCompleto || `${userObj.nombre || ''} ${userObj.apellidos || ''}`.trim() || userObj.username,
                // Lógica de salvavidas: si no hay tipo, miramos el rol.
                tipo: userObj.tipo || (userObj.role === 'admin' || userObj.role === 'empleado' ? 'empleado' : 'usuario'),
                isActive: userObj.isActive ?? true
            };
        });

        res.json(usuariosFormateados);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el listado unificado', error });
    }
};

export const createEmpleado = async (req: Request, res: Response) => {
    try {
        const { nombre, dni, email, puesto, password, role } = req.body;

        if (!email || !password || !nombre) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, email o password)' });
        }

        const nuevoEmpleado = new User({
            nombre,
            email,
            username: email, // Mongoose suele pedir username. Si no existe, usa el email.
            dni,
            puesto,
            password,
            role: role || 'empleado'
        });

        const guardado = await nuevoEmpleado.save();
        res.status(201).json(guardado);
    } catch (error: any) {
        console.error("Error al guardar en MongoDB:", error);
        res.status(400).json({
            mensaje: 'Error de validación en la base de datos',
            error: error.message
        });
    }
};
