
import { Request, Response } from 'express';
import Proveedor from '../models/Proveedor';
import Propiedad from '../models/Propiedad';
import Movimiento from '../models/Movimiento';

// Obtener todos los proveedores
export const getAllProveedores = async (req: Request, res: Response) => {
    try {
        const proveedores = await Proveedor.find();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener proveedores' });
    }
};

// Crear un nuevo proveedor
export const createProveedor = async (req: Request, res: Response) => {
    try {
        const nuevo = new Proveedor(req.body);
        await nuevo.save();
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear proveedor' });
    }
};

export const registrarGastoComunidad = async (req: Request, res: Response) => {
    try {
        const { comunidadId, importeTotal, concepto, proveedorId } = req.body;

        const propiedades = await Propiedad.find({ comunidad: comunidadId });

        if (!propiedades.length) {
            return res.status(404).json({ mensaje: 'No hay propiedades en esta comunidad' });
        }

        const movimientos = propiedades.map(prop => ({
            fecha: new Date(),
            descripcion: `${concepto} (Ref: ${prop.referencia || 'S/N'})`,
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
        res.status(500).json({ mensaje: 'Error al repartir el gasto', error: error.message });
    }
};