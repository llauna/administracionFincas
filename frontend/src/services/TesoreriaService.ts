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
        const url = datos.tipoCuenta === 'banco' ? 'http://localhost:5000/api/tesoreria/bancos' : 'http://localhost:5000/api/tesoreria/cajas';
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(datos)
        });
        if (!response.ok) throw new Error('Error al crear la cuenta');
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
    }




};