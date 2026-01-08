import mongoose from 'mongoose';

const ComunidadSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    direccion: { type: String },
    codigoPostal: { type: String },
    ciudad: { type: String },
    pais: { type: String },
    numPisos: { type: Number, required: true, default: 0 },
    pisosPorBloque: { type: Number, required: true, default: 0 },
    localesPorPlanta: { type: Number, required: true, default: 0 },
    plazasParking: { type: Number, required: true, default: 0 },
    tieneLocales: { type: Boolean, required: true, default: false },
    tieneParking: { type: Boolean, required: true, default: false },
    propietarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Propietario' }]
}, { timestamps: true });

export default mongoose.model('Comunidad', ComunidadSchema);