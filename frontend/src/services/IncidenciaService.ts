import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const IncidenciaService = {
    async getAll() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/incidencias`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async create(incidenciaData: any) {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/incidencias`, incidenciaData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};