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

export const crearBanco = async (req: Request, res: Response) => {
    try {
        const datos = { ...req.body };

        // Si viene de 'admin_oficina', limpiamos el campo comunidad para que no de error de ID
        if (datos.comunidad === 'admin_oficina' || !datos.comunidad) {
            delete datos.comunidad;
            datos.esAdministracion = true;
        }

        const nuevoBanco = new Banco(datos);
        await nuevoBanco.save();
        res.status(201).json(nuevoBanco);
    } catch (error: any) {
        console.error("❌ Error al crear banco:", error.message);
        res.status(400).json({ mensaje: 'Error al crear el banco', error: error.message });
    }
};

// NUEVA FUNCIÓN: Crear Caja
export const crearCaja = async (req: Request, res: Response) => {
    try {
        const datos = { ...req.body };

        if (datos.comunidad === 'admin_oficina' || !datos.comunidad) {
            delete datos.comunidad;
            datos.esAdministracion = true;
        }

        const nuevaCaja = new Caja(datos);
        await nuevaCaja.save();
        res.status(201).json(nuevaCaja);
    } catch (error: any) {
        console.error("❌ Error al crear caja:", error.message);
        res.status(400).json({ mensaje: 'Error al crear la caja', error: error.message });
    }
};

export const realizarAjusteSaldo = async (req: Request, res: Response) => {
    try {
        const { cuentaId, tipoCuenta, nuevoSaldo, motivo } = req.body;
        const Modelo = tipoCuenta === 'banco' ? Banco : Caja;

        const cuenta = await Modelo.findByIdAndUpdate(
            cuentaId,
            { saldoActual: nuevoSaldo },
            { new: true }
        );

        if (!cuenta) return res.status(404).json({ mensaje: 'Cuenta no encontrada' });

        await Movimiento.create({
            descripcion: `AJUSTE MANUAL: ${motivo || 'Sin motivo especificado'}`,
            importe: 0,
            tipo: 'Ingreso',
            [tipoCuenta === 'banco' ? 'cuentaBanco' : 'cuentaCaja']: cuentaId,
            fecha: new Date(),
            esAdministracion: cuenta.esAdministracion || false,
            comunidad: cuenta.comunidad || null
        });

        res.json({ mensaje: 'Saldo ajustado correctamente', cuenta });
    } catch (error: any) {
        res.status(500).json({ mensaje: 'Error al ajustar saldo', error: error.message });
    }
};

export const realizarTransferencia = async (req: Request, res: Response) => {
    try {
        const { cuentaOrigenId, tipoOrigen, cuentaDestinoId, tipoDestino, importe } = req.body;

        if (!cuentaOrigenId || !cuentaDestinoId || !importe) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios para la transferencia' });
        }

        const ModeloOrigen = tipoOrigen === 'banco' ? Banco : Caja;
        const ModeloDestino = tipoDestino === 'banco' ? Banco : Caja;

        // 1. Restar el importe de la cuenta de origen
        const origen = await ModeloOrigen.findByIdAndUpdate(
            cuentaOrigenId,
            { $inc: { saldoActual: -importe } },
            { new: true }
        );

        // 2. Sumar el importe a la cuenta de destino
        const destino = await ModeloDestino.findByIdAndUpdate(
            cuentaDestinoId,
            { $inc: { saldoActual: importe } },
            { new: true }
        );

        if (!origen || !destino) {
            throw new Error('No se pudo encontrar una de las cuentas involucradas');
        }

        // 3. Registrar el movimiento para el historial
        // Nota: esAdministracion y comunidad se heredan de la cuenta de origen
        await Movimiento.create({
            descripcion: `TRANSFERENCIA: De ${origen.nombreEntidad || origen.nombre} a ${destino.nombreEntidad || destino.nombre}`,
            importe: importe,
            tipo: 'Gasto', // Se registra como salida en la cuenta origen
            [tipoOrigen === 'banco' ? 'cuentaBanco' : 'cuentaCaja']: cuentaOrigenId,
            fecha: new Date(),
            esAdministracion: origen.esAdministracion || false,
            comunidad: origen.comunidad || null
        });

        res.json({ mensaje: 'Transferencia realizada con éxito' });
    } catch (error: any) {
        console.error("❌ Error en transferencia:", error.message);
        res.status(500).json({ mensaje: 'Error al procesar la transferencia', error: error.message });
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