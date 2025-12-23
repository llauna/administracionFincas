export interface Comunidad {
    _id: string;
    nombre: string;
}

export interface Empresa {
    _id: string;
    nombre: string;
}

export interface IPropietario {
    _id: string;
    nombre: string;
    telefono?: string;
    email?: string;
    gestorFinca: string | { _id: string; nombre: string } | null;
    comunidades: Array<string | { _id: string; nombre: string }>;
    createdAt?: string;
    updatedAt?: string;
}

// Definición limpia de PropietarioDTO
export type PropietarioDTO = {
    nombre: string;
    telefono?: string;
    email?: string;
    gestorFinca: string;  // Siempre string en DTO
    comunidades: string[]; // Siempre string[] en DTO
};