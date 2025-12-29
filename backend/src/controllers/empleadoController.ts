import { Request, Response } from 'express';
import User from '../models/User';

export const getEmpleados = async (req: Request, res: Response) => {
    try {
        // Suponiendo que los empleados son usuarios con el rol 'empleado'
        const empleados = await User.find({ role: 'empleado' });
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener empleados', error });
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