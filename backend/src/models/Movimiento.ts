import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    descripcion: { type: String, required: true },
    importe: { type: Number, required: true },
    tipo: { type: String, enum: ['Ingreso', 'Gasto'], required: true },
    banco: { type: mongoose.Schema.Types.ObjectId, ref: 'Banco', required: true }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
