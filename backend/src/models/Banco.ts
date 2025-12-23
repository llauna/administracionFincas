import mongoose from 'mongoose';

const BancoSchema = new mongoose.Schema({
    nombreBanco: { type: String, required: true },
    direccion:   { type: String, required: true },
    poblacion:   { type: String, required: true },
    cp:          { type: String, required: true },
    cuenta:      { type: String, required: true },
    fecha:       { type: Date, required: true },
    descripcion: { type: String, required: true },
    cobros:      { type: Number, default: 0 },
    pagos:       { type: Number, default: 0 },
    saldo:       { type: Number, required: true }
});

module.exports = mongoose.model('Banco', BancoSchema);