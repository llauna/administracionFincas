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
    }
};