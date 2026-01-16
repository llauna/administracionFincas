import mongoose from 'mongoose';

const cajaSchema = new mongoose.Schema({
    nombre: { type: String, required: true }, // Ej: "Caja Fuerte Oficina" o "Caja Menuda Comunidad X"
    saldoActual: { type: Number, default: 0 },
    comunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad' }, // Opcional, si es null es de la Administración
    esAdministracion: { type: Boolean, default: false },
    responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Caja || mongoose.model('Caja', cajaSchema);