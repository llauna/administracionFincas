import { getAuthHeader } from './auth';
import type { Proveedor } from '../models/Proveedor';
import { MovimientoService } from './MovimientoService';

const API_URL = 'http://localhost:5000/api/proveedores';

export const ProveedorService = {
    async getAll(): Promise<Proveedor[]> {
        const response = await fetch(API_URL, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Error al obtener proveedores');
        return response.json();
    },

    async create(proveedor: Proveedor): Promise<Proveedor> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(proveedor)
        });
        return response.json();
    },

    async createFactura(datos: any): Promise<any> {
        // Delegamos toda la responsabilidad al MovimientoService
        // Él ya conoce la URL /api/movimientos/registrar-gasto y gestiona los headers
        return MovimientoService.registrarGasto(datos);
    }
};