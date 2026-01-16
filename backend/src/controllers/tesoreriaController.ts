import { Request, Response } from 'express';
import Banco from '../models/Banco';
import Caja from '../models/Caja';
import Movimiento from '../models/Movimiento';
import mongoose from 'mongoose';

export const getResumenTesoreria = async (req: Request, res: Response) => {
    try {
        const { comunidadId } = req.query;
        let query: any = {};

        if (comunidadId && comunidadId !== 'admin_oficina') {
            query.comunidad = comunidadId;
        } else if (comunidadId === 'admin_oficina') {
            query.esAdministracion = true;
        }

        const [bancos, cajas] = await Promise.all([
            Banco.find(query).populate('comunidad', 'nombre'),
            Caja.find(query).populate('comunidad', 'nombre')
        ]);

        const totalBancos = bancos.reduce((acc, b) => acc + (b.saldoActual || 0), 0);
        const totalCajas = cajas.reduce((acc, c) => acc + (c.saldoActual || 0), 0);

        res.json({
            bancos,
            cajas,
            totales: {
                bancos: totalBancos,
                cajas: totalCajas,
                global: totalBancos + totalCajas
            }
        });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al obtener resumen de tesorería', error: error.message });
    }
};

/**
 * Función interna para actualizar saldos (se llamará desde el registro de movimientos)
 */
export const actualizarSaldoCuenta = async (cuentaId: string, tipoCuenta: 'banco' | 'caja', importe: number, tipoMovimiento: 'Ingreso' | 'Gasto') => {
    const sesion = await mongoose.startSession();
    sesion.startTransaction();
    try {
        const Modelo = tipoCuenta === 'banco' ? Banco : Caja;
        const variacion = tipoMovimiento === 'Ingreso' ? importe : -importe;

        await Modelo.findByIdAndUpdate(
            cuentaId,
            { $inc: { saldoActual: variacion } },
            { session: sesion }
        );

        await sesion.commitTransaction();
    } catch (error) {
        await sesion.abortTransaction();
        throw error;
    } finally {
        sesion.endSession();
    }
};