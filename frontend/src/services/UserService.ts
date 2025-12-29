const API_URL = 'http://localhost:5000/api';

export type UserRole = 'admin' | 'editor' | 'viewer' | 'empleado';

export interface User {
    _id?: string;
    username: string;
    email: string;
    role: UserRole;
    nombreCompleto: string;
    puesto: string;
    departamento: string;
    fechaContratacion: string | Date;
    telefono?: string;
    direccion?: string;
    createdAt?: Date;
    lastLogin?: Date;
    isActive?: boolean;
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    role?: UserRole;
    nombreCompleto?: string;
    puesto?: string;
    departamento?: string;
    telefono?: string;
    direccion?: string;
    isActive?: boolean;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const UserService = {
    /**
     * Obtiene todos los usuarios
     */
    async getAll(): Promise<any[]> {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener los usuarios');
        }

        return response.json();
    },

    /**
     * Obtiene un usuario por su ID
     */
    async getById(id: string): Promise<User> {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener el usuario');
        }

        return response.json();
    },

    /**
     * Crea un nuevo usuario
     */
    async create(userData: Omit<User, '_id' | 'createdAt' | 'lastLogin'>): Promise<User> {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear el usuario');
        }

        return response.json();
    },

    /**
     * Actualiza un usuario existente
     */
    async update(id: string, userData: UpdateUserData): Promise<User> {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el usuario');
        }

        return response.json();
    },

    /**
     * Elimina un usuario
     */
    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar el usuario');
        }
    },

    /**
     * Cambia la contraseña de un usuario
     */
    async changePassword(id: string, passwordData: ChangePasswordData): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${id}/change-password`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(passwordData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al cambiar la contraseña');
        }
    },

    /**
     * Actualiza el rol de un usuario
     */
    async updateRole(id: string, role: UserRole): Promise<User> {
        const response = await fetch(`${API_URL}/usuarios/${id}/role`, {
            method: 'PATCH',
            headers: getAuthHeader(),
            body: JSON.stringify({ role })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el rol del usuario');
        }

        return response.json();
    },

    /**
     * Activa o desactiva un usuario
     */
    async toggleStatus(id: string, isActive: boolean): Promise<User> {
        const response = await fetch(`${API_URL}/usuarios/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeader(),
            body: JSON.stringify({ isActive })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el estado del usuario');
        }

        return response.json();
    }
};