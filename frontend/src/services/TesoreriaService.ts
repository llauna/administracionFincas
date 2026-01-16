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
    }
};