import type { Empresa } from "../models/Empresa";

const API_URL = 'http://localhost:5000/api'; // Ajusta el puerto según tu configuración

export const EmpresaService = {
    async getAll(): Promise<any[]> {
        const response = await fetch(`${API_URL}/empresas`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener las empresas');
        return response.json();
    },

    async create(data: any): Promise<any> {
        const response = await fetch(`${API_URL}/empresas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al crear la empresa');
        return response.json();
    },

    // Obtener una empresa por ID
    async getById(id: string): Promise<Empresa> {
        const response = await fetch(`${API_URL}/empresas/${id}`);
        if (!response.ok) {
            throw new Error('Empresa no encontrada');
        }
        return response.json();
    }
};