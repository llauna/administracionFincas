import { Request, Response } from 'express';
import mongoose from "mongoose";
import Movimiento from '../models/Movimiento'; // Esta línea debería dejar de dar error ahora
import Propiedad from '../models/Propiedad';

export const crearGastoRepartido = async (req: Request, res: Response) => {
    try {
        const { comunidadId, importeTotal, descripcion, proveedorId } = req.body;

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
            propietario: prop.propietario,
            proveedor: proveedorId
        }));

        await Movimiento.insertMany(movimientos);
        res.status(201).json({ mensaje: 'Gasto repartido con éxito' });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al repartir gasto', error: error.message });
    }
};

export const getMovimientosPorProveedor = async (req: Request, res: Response) => {
    try {
        const { proveedorId } = req.params;

        const movimientosAgrupados = await Movimiento.aggregate([
            { $match: { proveedor: new mongoose.Types.ObjectId(proveedorId) } },
            {
                $group: {
                    _id: "$descripcion", // Agrupamos por el concepto
                    fecha: { $first: "$fecha" },
                    importeTotal: { $sum: "$importe" },
                    ids: { $push: "$_id" } // Guardamos los IDs para poder borrar todo el bloque
                }
            },
            { $sort: { fecha: -1 } }
        ]);

        res.json(movimientosAgrupados);
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al obtener movimientos', error: error.message });
    }
};

export const deleteMovimientosAgrupados = async (req: Request, res: Response) => {
    try {
        const { descripcion, proveedorId } = req.body;

        // Borramos todos los movimientos que coincidan con estos criterios
        const resultado = await Movimiento.deleteMany({
            descripcion: descripcion,
            proveedor: proveedorId
        });

        res.json({ mensaje: `Eliminados ${resultado.deletedCount} registros correctamente` });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al eliminar movimientos', error: error.message });
    }
};