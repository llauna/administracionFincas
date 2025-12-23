import mongoose from 'mongoose';

const EmpresaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String },
    email: { type: String },
    cif: { type: String },
    comunidades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad' }],
    propietarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Propietario' }]
}, { timestamps: true });

export default mongoose.models.Empresa || mongoose.model('Empresa', EmpresaSchema);
