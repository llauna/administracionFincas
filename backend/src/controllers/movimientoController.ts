import { Request, Response } from 'express';
import mongoose from "mongoose";
import Movimiento from '../models/Movimiento';
import Propiedad from '../models/Propiedad';
import { actualizarSaldoCuenta } from './tesoreriaController';

export const registrarGasto = async (req: Request, res: Response) => {
    console.log("🚀 Iniciando proceso de registro de gasto...");
    try {
        const { comunidadId, proveedorId, concepto, importeTotal, tipo, numeroFactura, tipoIva, cuentaBancoId, cuentaCajaId } = req.body;

        // Cálculo de IVA (Asumimos que importeTotal es el TOTAL factura)
        const porcentajeIva = tipoIva || 21; // Por defecto 21% si no se especifica
        const factorIva = 1 + (porcentajeIva / 100);

        const base = Number((importeTotal / (1 + (porcentajeIva / 100))).toFixed(2));
        const cuota = Number((importeTotal - base).toFixed(2));

        const propiedades = await Propiedad.find({ comunidad: comunidadId });

        if (!propiedades || propiedades.length === 0) {
            console.log("⚠️ No se encontraron propiedades");
            return res.status(404).json({ mensaje: 'No hay propiedades en esta comunidad' });
        }

        const movimientos = propiedades.map(prop => {
            const coeficiente = prop.coeficiente || 0;
            const parteProporcional = Number((importeTotal * (coeficiente / 100)).toFixed(2));

            const baseProporcional = Number((parteProporcional / factorIva).toFixed(2));
            const cuotaProporcional = Number((parteProporcional - baseProporcional).toFixed(2));

            return {
                comunidad: comunidadId,
                propiedad: prop._id,
                propietario: prop.propietario,
                proveedor: proveedorId,
                fecha: new Date(),
                descripcion: concepto,
                importe: parteProporcional,
                baseImponible: baseProporcional,
                tipoIva: porcentajeIva,
                ivaCuota: cuotaProporcional,
                tipo: 'Gasto',
                categoria: tipo || 'factura',
                cuentaBanco: cuentaBancoId || null,
                cuentaCaja: cuentaCajaId || null
            };
        });

        await Movimiento.insertMany(movimientos);
        // ACTUALIZACIÓN AUTOMÁTICA DE SALDOS
        if (cuentaBancoId) {
            await actualizarSaldoCuenta(cuentaBancoId, 'banco', importeTotal, 'Gasto');
        } else if (cuentaCajaId) {
            await actualizarSaldoCuenta(cuentaCajaId, 'caja', importeTotal, 'Gasto');
        }

        console.log("✅ Reparto y saldos actualizados");
        return res.status(201).json({ mensaje: 'Gasto registrado y saldos actualizados correctamente' });

    } catch (error: any) {
        console.error("❌ ERROR CRÍTICO en registrarGasto:", error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
    }
};

export const getMovimientosPorProveedor = async (req: Request, res: Response) => {
    try {
        const { proveedorId } = req.params;

        // Convertimos el ID a ObjectId para asegurar la compatibilidad en el aggregate
        const pId = new mongoose.Types.ObjectId(proveedorId);

        const movimientosAgrupados = await Movimiento.aggregate([
            {
                $match: {
                    proveedor: pId
                }
            },
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
                    _id: "$descripcion", // Agrupamos por concepto para simular "una factura"
                    fecha: { $first: "$fecha" },
                    comunidadId: { $first: "$comunidad" },
                    importeTotalFactura: { $sum: "$importe" },
                    reparto: {
                        $push: {
                            piso: { $arrayElemAt: ["$infoPropiedad.piso", 0] },
                            puerta: { $arrayElemAt: ["$infoPropiedad.puerta", 0] },
                            importe: "$importe"
                        }
                    }
                }
            },
            { $sort: { fecha: -1 } }
        ]);

        const resultadoFinal = movimientosAgrupados.map(grupo => ({
            ...grupo,
            importeTotal: grupo.importeTotalFactura // Renombramos para el frontend
        }));

        res.json(resultadoFinal);
    } catch (error: any) {
        console.error("❌ Error en getMovimientosPorProveedor:", error.message);
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

export const getByComunidadAndYear = async (req: Request, res: Response) => {
    try {
        const { comunidadId, year } = req.params;

        // Definimos el inicio y fin del año de forma más robusta
        const startDate = new Date(parseInt(year), 0, 1, 0, 0, 0); // 1 de Enero
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59); // 31 de Diciembre

        // Lógica de filtro flexible
        let query: any = {
            fecha: { $gte: startDate, $lte: endDate }
        };

        if (comunidadId === 'admin_oficina') {
            query.esAdministracion = true;
        } else {
            query.comunidad = comunidadId;
            // Busca los que son false O los que no tienen el campo definido aún
            query.esAdministracion = { $ne: true };
        }

        const movimientos = await Movimiento.find(query)
            .populate('propiedad', 'piso puerta tipo')
            .sort({ fecha: 1 }); // Ordenados por fecha ascendente
                res.json(movimientos);
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al obtener movimientos', error: error.message });
    }
};