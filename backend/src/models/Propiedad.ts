import mongoose from 'mongoose';

const PropiedadSchema = new mongoose.Schema({
    tipo: { type: String, enum: ['piso', 'local', 'garaje', 'trastero', 'casa', 'otro'], default: 'piso' },
    referencia: { type: String },
    direccion: { type: String, required: true },
    numero: { type: String },
    piso: { type: String },
    puerta: { type: String },
    estado: {
        type: String,
        enum: ['disponible', 'alquilado', 'ocupado', 'en_mantenimiento', 'baja'],
        default: 'disponible'
    },
    comunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad', required: true },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'Propietario', required: true },
    coeficiente: { type: Number, default: 0 }
}, { timestamps: true });

// LA CLAVE: Cambiar 'Propietario' por 'Propiedad'
export default mongoose.models.Propiedad || mongoose.model('Propiedad', PropiedadSchema);