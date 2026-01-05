import mongoose, { Document, Schema } from 'mongoose';
import {v4 as uuidv4} from 'uuid';

// Interfaz para TypeScript
export interface IIncidencia extends Document {
    idIncidencia: string;
    titulo: string;
    descripcionDetallada: string;
    gravedadImpacto: 'Baja' | 'Media' | 'Alta' | 'Crítica';
    estado: 'Pendiente' | 'En Proceso' | 'Resuelta' | 'Cerrada';
    comunidad: mongoose.Types.ObjectId;
    propietario?: mongoose.Types.ObjectId;
    proveedorId?: mongoose.Types.ObjectId;
    reportadoPor: {
        nombre: string;
        contacto: string;
    };
    reportadoPorUsuarioId: mongoose.Types.ObjectId;
    ubicacionEspecifica: string;
    fechaHoraReporte: Date;
}

const IncidenciaSchema: Schema = new Schema({
    idIncidencia: {
        type: String,
        default: () => uuidv4(),
        unique: true,
        trim: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcionDetallada: {
        type: String,
        required: true,
        trim: true
    },
    gravedadImpacto: {
        type: String,
        enum: ['Baja', 'Media', 'Alta', 'Crítica'],
        default: 'Media',
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'En Proceso', 'Resuelta', 'Cerrada'],
        default: 'Pendiente'
    },
    comunidad: {
        type: Schema.Types.ObjectId,
        ref: 'Comunidad',
        required: true
    },
    propietario: {
        type: Schema.Types.ObjectId,
        ref: 'Propietario'
    },
    proveedorId: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    reportadoPor: {
        nombre: { type: String, required: true, trim: true },
        contacto: { type: String, required: true, trim: true }
    },
    reportadoPorUsuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Cambiado a 'User' para que coincida con tu modelo de usuarios
        required: true
    },
    ubicacionEspecifica: {
        type: String,
        required: true,
        trim: true
    },
    fechaHoraReporte: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true // Esto crea automáticamente createdAt y updatedAt
});

// Índice para búsquedas rápidas por comunidad
IncidenciaSchema.index({ comunidad: 1, estado: 1 });

export default mongoose.model<IIncidencia>('Incidencia', IncidenciaSchema);