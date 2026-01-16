import { getAuthHeader } from './auth';

const API_URL = 'http://localhost:5000/api/tesoreria';

export const TesoreriaService = {
    async getResumen(comunidadId?: string): Promise<any> {
        const url = comunidadId
            ? `${API_URL}/resumen?comunidadId=${comunidadId}`
            : `${API_URL}/resumen`;

        const response = await fetch(url, {
            headers: getAuthHeader()
        });

        if (!response.ok) throw new Error('Error al obtener datos de tesorería');
        return response.json();
    },

    async crearCuenta(datos: any): Promise<any> {
        // Recuperamos el token manualmente para asegurar que no falle la autorización
        const token = localStorage.getItem('token');
        const url = datos.tipoCuenta === 'banco' ? `${API_URL}/bancos` : `${API_URL}/cajas`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (response.status === 401) {
            throw new Error('Sesión expirada. Por favor, reinicie sesión.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al crear la cuenta');
        }
        return response.json();
    },

    async realizarAjuste(datos: any): Promise<any> {
        const response = await fetch(`${API_URL}/ajuste`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(datos)
        });
        if (!response.ok) throw new Error('Error al realizar el ajuste');
        return response.json();
    },

    async realizarTransferencia(datos: any): Promise<any> {
        const response = await fetch(`${API_URL}/transferencia`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(datos)
        });
        if (!response.ok) throw new Error('Error al realizar la transferencia');
        return response.json();
    }
};