import { getAuthHeader } from './auth';
import type {Proveedor} from '../models/Proveedor';

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

    async createFactura(factura: any): Promise<any> {
        const token = localStorage.getItem('token');
        // Usamos la ruta directa a movimientos
        const response = await fetch('http://localhost:5000/api/movimientos/registrar-gasto', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(factura)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error en el servidor');
        }
        return response.json();
    }
};