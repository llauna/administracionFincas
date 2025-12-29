import { Request, Response } from 'express';
import User, { IUser } from '../models/User';  // Asegúrate de que la ruta sea correcta

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
    }
};