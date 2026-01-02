import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';

export const usuarioController = {
    // Obtener todos los usuarios
    async getAll(req: Request, res: Response) {
        try {
            const usuarios = await User.find({});
            res.json(usuarios);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
        }
    },

    // Obtener usuario por ID
    async getById(req: Request, res: Response) {
        try {
            const usuario = await User.findById(req.params.id);
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json(usuario);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
        }
    },

    // Crear nuevo usuario
    async create(req: Request, res: Response) {
        try {
            const nuevoUsuario = new User(req.body);
            const usuarioGuardado = await nuevoUsuario.save();
            res.status(201).json(usuarioGuardado);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
        }
    },

    // Actualizar usuario
    async update(req: Request, res: Response) {
        try {
            const usuarioActualizado = await User.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );
            if (!usuarioActualizado) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json(usuarioActualizado);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al actualizar el usuario', error: error.message });
        }
    },

    // Eliminar usuario
    async delete(req: Request, res: Response) {
        try {
            const usuarioEliminado = await User.findByIdAndDelete(req.params.id);
            if (!usuarioEliminado) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
        }
    },

};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // 1. Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        // 2. Actualizar a la nueva contraseña
        // El middleware pre('save') en User.ts se encargará de cifrarla
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar la contraseña', error });
    }
};

export const updatePerfil = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombreCompleto, telefono, direccion } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { nombreCompleto, telefono, direccion },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el perfil', error });
    }
};