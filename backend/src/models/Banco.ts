import mongoose from 'mongoose';

const bancoSchema = new mongoose.Schema({
    nombreEntidad: { type: String, required: true }, // Ej: Santander, Sabadell
    iban: { type: String, required: true, unique: true },
    bic: { type: String },
    saldoInicial: { type: Number, default: 0 },
    saldoActual: { type: Number, default: 0 },
    comunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad', required: true },
    esPrincipal: { type: Boolean, default: true },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Banco || mongoose.model('Banco', bancoSchema);