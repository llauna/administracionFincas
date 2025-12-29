export interface User {
    _id: string;
    username: string;
    nombreCompleto: string;
    email: string;
    role: 'admin' | 'empleado' | 'cliente';
    tipo?: string;  // Añadimos el campo tipo como opcional
    puesto?: string;
    departamento?: string;
    // ... otros campos que necesites
}

export type UserRole = User['role'];