import { getAuthHeader } from './auth';

const API_URL = 'http://localhost:5000/api';

export const MovimientoService = {
    async getByComunidadAndYear(comunidadId: string, year: number): Promise<any[]> {
        try {
            const response = await fetch(`${API_URL}/movimientos/comunidad/${comunidadId}/year/${year}`, {
                method: 'GET',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener los movimientos');
            }

            return response.json();
        } catch (error) {
            console.error('Error en MovimientoService.getByComunidadAndYear:', error);
            throw error;
        }
    },

    // Aquí puedes agregar más métodos según sea necesario
    // siguiendo el mismo patrón
    async create(movimiento: any): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/movimientos`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(movimiento)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el movimiento');
            }

            return data;
        } catch (error) {
            console.error('Error en MovimientoService.create:', error);
            throw error;
        }
    },

    // Ejemplo de otro método que podrías necesitar
    async getById(id: string): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/movimientos/${id}`, {
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Movimiento no encontrado');
            }

            return response.json();
        } catch (error) {
            console.error('Error en MovimientoService.getById:', error);
            throw error;
        }
    },

    // Método específico para el reparto de gastos con afectación a tesorería
    async registrarGasto(datosGasto: any): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/movimientos/registrar-gasto`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(datosGasto)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error al registrar el gasto');
            }

            return data;
        } catch (error) {
            console.error('Error en MovimientoService.registrarGasto:', error);
            throw error;
        }
    },

    async generarFacturaServicio(datos: any): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/movimientos/factura-servicio-empresa`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(datos)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensaje || 'Error al generar factura');
            return data;
        } catch (error) {
            console.error('Error en MovimientoService.generarFacturaServicio:', error);
            throw error;
        }
    }
};