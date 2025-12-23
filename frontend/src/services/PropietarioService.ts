import type { Propietario, PropietarioDTO } from '../models/Propietario';

const API_URL = 'http://localhost:5000/api'; // Ajusta el puerto según tu configuración

export const PropietarioService = {
    async getAll(): Promise<any[]> {
        const response = await fetch(`${API_URL}/propietarios`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener los propietarios');
        return response.json();
    },

    // Obtener un propietario por ID
    async getById(id: string): Promise<Propietario> {
        const response = await fetch(`${API_URL}/propietarios/${id}`);
        if (!response.ok) {
            throw new Error('Propietario no encontrado');
        }
        return response.json();
    },

    // Crear un nuevo propietario
    async create(propietario: PropietarioDTO): Promise<Propietario> {
        // Asegurarse de que los datos estén en el formato correcto
        const dataToSend = {
            ...propietario,
            gestorFinca: propietario.gestorFinca, // Ya debería ser un string
            comunidades: Array.isArray(propietario.comunidades)
                ? propietario.comunidades
                : [propietario.comunidades].filter(Boolean)
        };

        const response = await fetch(`${API_URL}/propietarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(dataToSend)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear el propietario');
        }

        return response.json();
    },

    // Actualizar un propietario existente
    async update(id: string, propietario: Partial<PropietarioDTO>): Promise<Propietario> {
        const response = await fetch(`${API_URL}/propietarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(propietario)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el propietario');
        }

        return response.json();
    },

    // Eliminar un propietario
    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/propietarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar el propietario');
        }
    }
};