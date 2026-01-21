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
        const porcentajeIva = Number(tipoIva) || 21;
        const factorIva = 1 + (porcentajeIva / 100);

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
                propietario: prop.propietario || null,
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

        const facturas = await Movimiento.aggregate([
            { $match: { proveedor: new mongoose.Types.ObjectId(proveedorId) } },
            {
                // Unimos con Propiedades para obtener los coeficientes reales
                $lookup: {
                    from: "propiedads",
                    localField: "propiedad",
                    foreignField: "_id",
                    as: "detallePropiedad"
                }
            },
            { $unwind: "$detallePropiedad" },
            {
                $group: {
                    _id: "$descripcion",
                    fecha: { $first: "$fecha" },
                    importeTotal: { $sum: "$importe" },
                    baseImponible: { $sum: "$baseImponible" },
                    ivaCuota: { $sum: "$ivaCuota" },
                    // SUMAMOS los coeficientes para saber si llegamos al 100%
                    coeficienteTotal: { $sum: "$detallePropiedad.coeficiente" },
                    comunidadId: { $first: "$comunidad" },
                    reparto: {
                        $push: {
                            piso: "$detallePropiedad.piso",
                            puerta: "$detallePropiedad.puerta",
                            coeficiente: "$detallePropiedad.coeficiente",
                            importe: "$importe"
                        }
                    }
                }
            },
            { $sort: { fecha: -1 } }
        ]);

        res.json(facturas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al agrupar facturas", error });
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
        const startDate = new Date(parseInt(year), 0, 1, 0, 0, 0);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);

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
export const generarFacturaServicioEmpresa = async (req: Request, res: Response) => {
    try {
        const { comunidadId, nombreEmpresa, baseImponible, tipoIva } = req.body;

        const porcentajeIva = Number(tipoIva) || 21;
        const base = Number(Number(baseImponible).toFixed(2));
        const cuota = Number((base * (porcentajeIva / 100)).toFixed(2));
        const importeTotal = Number((base + cuota).toFixed(2));

        // 1. REGISTRO EN LA EMPRESA (Ingreso/Venta)
        const ingresoEmpresa = new Movimiento({
            descripcion: `FRA: ${nombreEmpresa}`,
            importe: importeTotal,
            baseImponible: base,
            tipoIva: porcentajeIva,
            ivaCuota: cuota,
            tipo: 'Ingreso',
            esAdministracion: true,
            fecha: new Date()
        });

        // 2. REGISTRO EN LA COMUNIDAD (Gasto repartido)
        const propiedades = await Propiedad.find({ comunidad: comunidadId });
        const movimientosGasto = propiedades.map(prop => ({
            comunidad: comunidadId,
            propiedad: prop._id,
            propietario: prop.propietario || null,
            descripcion: `${nombreEmpresa}: ${baseImponible}€ + IVA`,
            importe: Number((importeTotal * ((prop.coeficiente || 0) / 100)).toFixed(2)),
            baseImponible: Number((base * ((prop.coeficiente || 0) / 100)).toFixed(2)),
            tipoIva: porcentajeIva,
            ivaCuota: Number((cuota * ((prop.coeficiente || 0) / 100)).toFixed(2)),
            tipo: 'Gasto',
            categoria: 'factura',
            fecha: new Date()
        }));

        await Promise.all([
            ingresoEmpresa.save(),
            Movimiento.insertMany(movimientosGasto)
        ]);

        res.status(201).json({ mensaje: 'Factura generada y repartida a la comunidad' });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al generar factura cruzada', error: error.message });
    }
};