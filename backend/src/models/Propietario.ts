import mongoose from 'mongoose';

const PropietarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String },
    email: { type: String },
    gestorFinca: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    comunidades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad' }]
}, { timestamps: true });

export default mongoose.model('Propietario', PropietarioSchema);