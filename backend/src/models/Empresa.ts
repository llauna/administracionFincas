import mongoose from 'mongoose';

const EmpresaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String },
    email: { type: String },
    cif: { type: String },
    comunidades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad' }],
    propietarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Propietario' }]
}, { timestamps: true });

module.exports = mongoose.model('Empresa', EmpresaSchema);
