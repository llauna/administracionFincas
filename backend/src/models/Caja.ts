import mongoose from 'mongoose';

const CajaSchema = new mongoose.Schema({
    comunidadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad', required: true },
    fecha: { type: Date, required: true },
    concepto: { type: String, required: true },
    importe: { type: Number, required: true },
    tipo: { type: String, enum: ['Ingreso', 'Gasto'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Caja', CajaSchema);