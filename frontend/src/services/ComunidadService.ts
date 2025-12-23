const API_URL = 'http://localhost:5000/api'; // Ajusta el puerto según tu configuración

export const ComunidadService = {
    async getAll(): Promise<any> {
        const response = await fetch(`${API_URL}/comunidades`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener las comunidades');
        return response.json();
    },

    async getById(id: string): Promise<any> {
        const response = await fetch(`${API_URL}/comunidades/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener la comunidad');
        return response.json();
    },

    async create(data: any): Promise<any> {
        const response = await fetch(`${API_URL}/comunidades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al crear la comunidad');
        return response.json();
    },

    async update(id: string, data: any): Promise<any> {
        const response = await fetch(`${API_URL}/comunidades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al actualizar la comunidad');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/comunidades/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al eliminar la comunidad');
    }
};