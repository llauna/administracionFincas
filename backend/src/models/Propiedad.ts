import {Schema, model, Document, Model, CallbackWithoutResultAndOptionalError} from 'mongoose';

export interface IPropiedad extends Document {
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    tipo: 'piso' | 'casa' | 'local' | 'garaje' | 'trastero';
    metrosCuadrados: number;
    numHabitaciones?: number;
    numBanos?: number;
    descripcion?: string;
    precioAlquiler: number;
    gastosComunidad: number;
    disponible: boolean;
    propietario: Schema.Types.ObjectId;
    inquilinoActual?: Schema.Types.ObjectId;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}

type PropiedadModel = Model<IPropiedad>;

const propiedadSchema = new Schema<IPropiedad, PropiedadModel>({
    direccion: { type: String, required: true },
    ciudad: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    tipo: {
        type: String,
        enum: ['piso', 'casa', 'local', 'garaje', 'trastero'],
        required: true
    },
    metrosCuadrados: { type: Number, required: true },
    numHabitaciones: { type: Number },
    numBanos: { type: Number },
    descripcion: { type: String },
    precioAlquiler: { type: Number, required: true },
    gastosComunidad: { type: Number, required: true },
    disponible: { type: Boolean, default: true },
    propietario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    inquilinoActual: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fechaCreacion: { type: Date, default: Date.now },
    fechaActualizacion: { type: Date, default: Date.now }
});

// Middleware para actualizar la fecha de actualización
propiedadSchema.pre('save', function( this: any, next: CallbackWithoutResultAndOptionalError ) {
    this.fechaActualizacion = new Date();
    next();
} as any);

export const Propiedad = model<IPropiedad, PropiedadModel>('Propiedad', propiedadSchema);