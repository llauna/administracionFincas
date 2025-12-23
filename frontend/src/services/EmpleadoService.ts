const API_URL = 'http://localhost:5000/api';

export const EmpleadoService = {
    async create(data: any): Promise<any> {
        const response = await fetch(`${API_URL}/empleados`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al crear el empleado');
        return response.json();
    }
};