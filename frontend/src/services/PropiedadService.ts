
import { getAuthHeader } from './auth';
import type {Propiedad, PropiedadDTO} from '../models/Propiedad';

const API_URL = 'http://localhost:5000/api'; // Ajusta la URL de tu API

export const PropiedadService = {
    async getAll(): Promise<any> {
        const response = await fetch(`${API_URL}/propiedades`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener las propiedades');
        return response.json();
    },

    // Obtener una propiedad por ID
    async getById(id: string): Promise<Propiedad> {
        const response = await fetch(`${API_URL}/propiedades/${id}`, {
            headers: getAuthHeader()
        });
        if (!response.ok) {
            throw new Error('Propiedad no encontrada');
        }
        return response.json();
    },

    // Crear una nueva propiedad
    async create(propiedad: PropiedadDTO): Promise<Propiedad> {
        try {
            const response = await fetch(`${API_URL}/propiedades`, {
                method: 'POST',
                headers: getAuthHeader(),  // Usamos directamente getAuthHeader() que ya incluye Content-Type
                body: JSON.stringify(propiedad),
            });


            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear la propiedad');
            }

            return data;
        } catch (error: any) {
            console.error('Error en PropiedadService.create:', error);
            throw new Error(error.message || 'Error al crear la propiedad');
        }
    },

    // Actualizar una propiedad existente
    async update(id: string, propiedad: PropiedadDTO): Promise<Propiedad> {
        const response = await fetch(`${API_URL}/propiedades/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
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
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al eliminar la propiedad');
        }
    },

    async getByComunidad(comunidadId: string): Promise<Propiedad[]> {
        try {
            const response = await fetch(`${API_URL}/propiedades/comunidad/${comunidadId}`, {
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Error al obtener las propiedades de la comunidad');
            }

            return response.json();
        } catch (error) {
            console.error('Error en PropiedadService.getByComunidad:', error);
            throw error;
        }
    }
};