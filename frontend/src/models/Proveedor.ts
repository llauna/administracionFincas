export interface Proveedor {
    _id?: string;
    nif: string;
    nombre: string;
    direccion: string;
    poblacion: string;
    cp: string;
    tipoServicio: string;
    actividad: string;
    telefono: string;
    email: string;
    notas?: string;
}

export interface GastoFactura {
    _id?: string;
    proveedor: string; // ID del proveedor
    comunidad: string; // ID de la comunidad
    numeroFactura: string;
    fechaEmision: Date;
    importeTotal: number;
    iva: number;
    concepto: string;
    estado: 'pendiente' | 'pagado';
}