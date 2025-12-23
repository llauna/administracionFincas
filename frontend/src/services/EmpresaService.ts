import type { Empresa } from "../models/Empresa";

const API_URL = 'http://localhost:5000/api'; // Ajusta el puerto según tu configuración

export const EmpresaService = {
    // Obtener todas las empresas
    async getAll(): Promise<Empresa[]> {
        const response = await fetch(`${API_URL}/empresas`);
        if (!response.ok) {
            throw new Error('Error al obtener las empresas');
        }
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