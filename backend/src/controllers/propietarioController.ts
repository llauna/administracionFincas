import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Propietario from '../models/Propietario';

// Obtener todos los propietarios
export const getPropietarios = async (req: Request, res: Response) => {
    try {
        const propietarios = await Propietario.find()
            .populate('gestorFinca', 'nombre')
            .populate('comunidades', 'nombre');
        res.json(propietarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los propietarios', error });
    }
};

// Obtener un propietario por ID
export const getPropietarioById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de propietario no válido' });
        }

        const propietario = await Propietario.findById(id)
            .populate('gestorFinca', 'nombre')
            .populate('comunidades', 'nombre');

        if (!propietario) {
            return res.status(404).json({ message: 'Propietario no encontrado' });
        }

        res.json(propietario);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el propietario', error });
    }
};

// Crear un nuevo propietario
export const createPropietario = async (req: Request, res: Response) => {
    try {
        const { nombre, telefono, email, gestorFinca, comunidades } = req.body;

        // Validar que el gestor de finca existe
        if (!mongoose.Types.ObjectId.isValid(gestorFinca)) {
            return res.status(400).json({ message: 'ID de gestor de finca no válido' });
        }

        const nuevoPropietario = new Propietario({
            nombre,
            telefono,
            email,
            gestorFinca,
            comunidades: comunidades || []
        });

        const propietarioGuardado = await nuevoPropietario.save();
        res.status(201).json(propietarioGuardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el propietario', error });
    }
};

// Actualizar un propietario
export const updatePropietario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, email, gestorFinca, comunidades } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de propietario no válido' });
        }

        const propietarioActualizado = await Propietario.findByIdAndUpdate(
            id,
            {
                nombre,
                telefono,
                email,
                gestorFinca,
                comunidades: comunidades || []
            },
            { new: true }
        )
            .populate('gestorFinca', 'nombre')
            .populate('comunidades', 'nombre');

        if (!propietarioActualizado) {
            return res.status(404).json({ message: 'Propietario no encontrado' });
        }

        res.json(propietarioActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el propietario', error });
    }
};

// Eliminar un propietario
export const deletePropietario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de propietario no válido' });
        }

        const propietarioEliminado = await Propietario.findByIdAndDelete(id);

        if (!propietarioEliminado) {
            return res.status(404).json({ message: 'Propietario no encontrado' });
        }

        res.json({ message: 'Propietario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el propietario', error });
    }
};