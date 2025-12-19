import type {Propiedad, PropiedadDTO} from '../models/Propiedad';

const API_URL = 'http://tu-backend-url/api'; // Ajusta la URL de tu API

export const PropiedadService = {
    // Obtener todas las propiedades
    async getAll(): Promise<Propiedad[]> {
        const response = await fetch(`${API_URL}/propiedades`);
        if (!response.ok) {
            throw new Error('Error al obtener las propiedades');
        }
        return response.json();
    },

    // Obtener una propiedad por ID
    async getById(id: string): Promise<Propiedad> {
        const response = await fetch(`${API_URL}/propiedades/${id}`);
        if (!response.ok) {
            throw new Error('Propiedad no encontrada');
        }
        return response.json();
    },

    // Crear una nueva propiedad
    async create(propiedad: PropiedadDTO): Promise<Propiedad> {
        const response = await fetch(`${API_URL}/propiedades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propiedad),
        });
        if (!response.ok) {
            throw new Error('Error al crear la propiedad');
        }
        return response.json();
    },

    // Actualizar una propiedad existente
    async update(id: string, propiedad: PropiedadDTO): Promise<Propiedad> {
        const response = await fetch(`${API_URL}/propiedades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propiedad),
        });
        if (!response.ok) {
            throw new Error('Error al actualizar la propiedad');
        }
        return response.json();
    },

    // Eliminar una propiedad
    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/propiedades/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Error al eliminar la propiedad');
        }
    }
};