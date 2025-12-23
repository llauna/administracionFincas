import mongoose from 'mongoose';

const ComunidadSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    direccion: { type: String },
    poblacion: { type: String },
    cp: { type: String },
    provincia: { type: String },
    propietarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Propietario' }]
}, { timestamps: true });

export default mongoose.model('Comunidad', ComunidadSchema);