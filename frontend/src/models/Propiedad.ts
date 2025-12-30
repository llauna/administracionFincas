export interface ComunidadRef {
    _id: string;
    nombre: string;
}

export interface PropietarioRef {
    _id: string;
    nombre: string;
}

export interface Propiedad {
    id: string;
    referencia: string;
    direccion: string;
    piso?: string;
    puerta?: string;
    codigoPostal?: string;
    ciudad?: string;
    provincia?: string;
    pais?: string;
    metrosCuadrados?: number;
    numHabitaciones?: number;
    numBanos?: number;
    tipo: 'piso' | 'casa' | 'local' | 'trastero' | 'garaje' | 'otro';
    estado: 'disponible' | 'alquilado' | 'en_mantenimiento' | 'baja';
    comunidad: string | ComunidadRef;
    propietario: string | PropietarioRef;
    observaciones?: string;
    createdAt?: string;
    updatedAt?: string;
}

// DTO (Data Transfer Object) para crear/actualizar propiedades
export interface PropiedadDTO {
    referencia: string;
    direccion: string;
    piso?: string;
    portal?: string;
    puerta?: string;
    codigoPostal?: string;
    ciudad?: string;
    provincia?: string;
    pais?: string;
    metrosCuadrados?: number;
    numHabitaciones?: number;
    numBanos?: number;
    tipo: 'piso' | 'casa' | 'local' | 'trastero' | 'garaje' | 'otro';
    estado: 'disponible' | 'alquilado' | 'en_mantenimiento' | 'baja';
    comunidad: string;
    propietario: string;
    observaciones?: string;
}