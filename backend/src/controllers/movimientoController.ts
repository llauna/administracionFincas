import { Request, Response } from 'express';
import Movimiento from '../models/Movimiento'; // Esta línea debería dejar de dar error ahora
import Propiedad from '../models/Propiedad';

export const crearGastoRepartido = async (req: Request, res: Response) => {
    try {
        const { comunidadId, importeTotal, descripcion } = req.body;

        // Buscamos propiedades de la comunidad
        const propiedades = await Propiedad.find({ comunidad: comunidadId });

        if (!propiedades.length) {
            return res.status(404).json({ mensaje: 'No hay propiedades en esta comunidad' });
        }

        // Generamos los movimientos repartidos
        const movimientos = propiedades.map(prop => ({
            fecha: new Date(),
            descripcion: `${descripcion} (Piso ${prop.piso || ''} ${prop.puerta || ''})`,
            importe: Number((importeTotal * (prop.coeficiente / 100)).toFixed(2)),
            tipo: 'Gasto',
            comunidad: comunidadId,
            propiedad: prop._id,
            propietario: prop.propietario
        }));

        await Movimiento.insertMany(movimientos);
        res.status(201).json({ mensaje: 'Gasto repartido con éxito' });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al repartir gasto', error: error.message });
    }
};