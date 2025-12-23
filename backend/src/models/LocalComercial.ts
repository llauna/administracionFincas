import mongoose from 'mongoose';

const LocalComercialSchema = new mongoose.Schema({
    direccion: { type: String, required: true, trim: true },
    superficie: { type: Number, required: true },
    propietarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Propietario', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('LocalComercial', LocalComercialSchema);

