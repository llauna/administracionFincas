const API_URL = 'http://localhost:5000/api';

interface Empleado {
    id?: string;
    nombre: string;
    dni: string;
    puesto: string;
    email: string;
}



export const EmpleadoService = {
    async getAll(): Promise<any[]> {
        const response = await fetch(`${API_URL}/empleados`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener los empleados');
        return response.json();
    },

    async create(data: any): Promise<any> {
        const response = await fetch(`${API_URL}/empleados`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear el empleado');
        }
        return response.json();
    },

    async update(id: string, empleado: Partial<Empleado>): Promise<Empleado> {
        const response = await fetch(`${API_URL}/empleados/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(empleado)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el empleado');
        }
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/empleados/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || error.message || 'Error al eliminar el empleado');
        }
    }
};