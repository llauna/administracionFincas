import mongoose from 'mongoose';

const ViviendaSchema = new mongoose.Schema({
    idPropiedad:     { type: mongoose.Schema.Types.ObjectId, ref: 'Propiedad', required: true },
    numHabitaciones: { type: Number, required: true },
    superficie:      { type: Number, required: true }
});

module.exports = mongoose.model('Vivienda', ViviendaSchema);
