import { Request, Response } from 'express';
import mongoose from "mongoose";
import Movimiento from '../models/Movimiento';
import Propiedad from '../models/Propiedad';

export const registrarGasto = async (req: Request, res: Response) => {
    console.log("🚀 Iniciando proceso de registro de gasto...");
    try {
        const { comunidadId, proveedorId, concepto, importeTotal, tipo, numeroFactura } = req.body;

        const propiedades = await Propiedad.find({ comunidad: comunidadId });

        if (!propiedades || propiedades.length === 0) {
            console.log("⚠️ No se encontraron propiedades");
            return res.status(404).json({ mensaje: 'No hay propiedades en esta comunidad' });
        }

        const movimientos = propiedades.map(prop => {
            const coeficiente = prop.coeficiente || 0;
            const parteProporcional = Number((importeTotal * (coeficiente / 100)).toFixed(2));

            return {
                comunidad: comunidadId,
                propiedad: prop._id,
                propietario: prop.propietario,
                proveedor: proveedorId,
                fecha: new Date(),
                descripcion: concepto,
                importe: parteProporcional,
                tipo: 'Gasto',
                categoria: tipo || 'factura'
            };
        });

        await Movimiento.insertMany(movimientos);
        console.log("✅ Reparto completado con éxito");
        return res.status(201).json({ mensaje: 'Gasto repartido correctamente' });

    } catch (error: any) {
        console.error("❌ ERROR CRÍTICO en registrarGasto:", error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
    }
};

export const getMovimientosPorProveedor = async (req: Request, res: Response) => {
    try {
        const { proveedorId } = req.params;

        const movimientosAgrupados = await Movimiento.aggregate([
            { $match: { proveedor: new mongoose.Types.ObjectId(proveedorId) } },
            {
                $lookup: {
                    from: 'propiedads',
                    localField: 'propiedad',
                    foreignField: '_id',
                    as: 'infoPropiedad'
                }
            },
            {
                $group: {
                    _id: "$descripcion",
                    fecha: { $first: "$fecha" },
                    comunidadId: { $first: "$comunidad" }, // AÑADIMOS ESTO PARA EL FRONTEND
                    importeTotal: { $sum: "$importe" },
                    reparto: {
                        $push: {
                            piso: { $arrayElemAt: ["$infoPropiedad.piso", 0] },
                            puerta: { $arrayElemAt: ["$infoPropiedad.puerta", 0] },
                            importe: "$importe",
                            comunidad: "$comunidad" // También lo metemos aquí por seguridad
                        }
                    }
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

        const resultado = await Movimiento.deleteMany({
            descripcion: descripcion,
            proveedor: proveedorId
        });

        res.json({ mensaje: `Eliminados ${resultado.deletedCount} registros correctamente` });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al eliminar movimientos', error: error.message });
    }
};