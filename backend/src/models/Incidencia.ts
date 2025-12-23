import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
const { Schema } = mongoose;

const IncidenciaSchema = new Schema({
    idIncidencia: {
        type: String,
        default: () => uuidv4(),
        unique: true,
        trim: true
    },
    titulo: { type: String, trim: true }, // Campo del primer esquema
    descripcionDetallada: { type: String, required: true, trim: true },
    gravedadImpacto: {
        type: String,
        enum: ['Baja', 'Media', 'Alta', 'Crítica'], // Enum del segundo esquema
        required: true
    },
    estado: { type: String, default: 'Pendiente' }, // Campo del primer esquema
    comunidad: { type: Schema.Types.ObjectId, ref: 'Comunidad' }, // Campo del primer esquema
    propietario: { type: Schema.Types.ObjectId, ref: 'Propietario' }, // Campo del primer esquema
    proveedorId: { type: Schema.Types.ObjectId, ref: 'Proveedor' }, // Campo del segundo esquema
    reportadoPor: {
        nombre: { type: String, required: true, trim: true },
        contacto: { type: String, required: true, trim: true }
    },
    reportadoPorUsuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    ubicacionEspecifica: { type: String, required: true, trim: true }, // Campo del segundo esquema
    fechaHoraReporte: { type: Date, required: true, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Incidencia', IncidenciaSchema);
