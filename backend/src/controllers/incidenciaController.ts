import { Request, Response } from 'express';
import Incidencia from '../models/Incidencia';
import Propietario from '../models/Propietario';

export const incidenciaController = {
    /**
     * Obtiene incidencias filtradas por el rol del usuario
     */
    async getAll(req: Request, res: Response) {
        try {
            const { id: userId, role, email } = (req as any).user;
            let query = {};

            // Si es cliente/viewer, aplicamos el filtro de comunidades
            if (role !== 'admin' && role !== 'empleado') {
                const perfilPropietario = await Propietario.findOne({ email: email });

                if (perfilPropietario && perfilPropietario.comunidades) {
                    // Solo ve incidencias de las comunidades donde tiene propiedades
                    query = { comunidad: { $in: perfilPropietario.comunidades } };
                } else {
                    // Si no tiene comunidades, solo ve las que él mismo reportó
                    query = { reportadoPorUsuarioId: userId };
                }
            }

            const incidencias = await Incidencia.find(query)
                .populate('comunidad', 'nombre')
                .populate('reportadoPorUsuarioId', 'nombreCompleto')
                .sort({ createdAt: -1 });

            res.json(incidencias);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al obtener incidencias', error: error.message });
        }
    },

    /**
     * Crea una nueva incidencia
     */
    async create(req: Request, res: Response) {
        try {
            const { id: userId } = (req as any).user;
            const nuevaIncidencia = new Incidencia({
                ...req.body,
                reportadoPorUsuarioId: userId,
                fechaHoraReporte: new Date()
            });

            const guardada = await nuevaIncidencia.save();
            res.status(201).json(guardada);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al crear la incidencia', error: error.message });
        }
    },

    /**
     * Actualiza el estado o detalles de una incidencia
     */
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const actualizada = await Incidencia.findByIdAndUpdate(id, req.body, { new: true })
                .populate('comunidad', 'nombre');

            if (!actualizada) return res.status(404).json({ message: 'Incidencia no encontrada' });

            res.json(actualizada);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al actualizar incidencia', error: error.message });
        }
    },

    /**
     * Obtiene una incidencia por ID
     */
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const incidencia = await Incidencia.findById(id)
                .populate('comunidad', 'nombre')
                .populate('reportadoPorUsuarioId', 'nombreCompleto email');

            if (!incidencia) return res.status(404).json({ message: 'Incidencia no encontrada' });
            res.json(incidencia);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al obtener detalle', error: error.message });
        }
    }
};