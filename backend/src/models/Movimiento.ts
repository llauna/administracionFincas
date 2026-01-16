import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema({
    fecha: { type: Date, required: true, default: Date.now },
    descripcion: { type: String, required: true },
    importe: { type: Number, required: true }, // Importe TOTAL
    baseImponible: { type: Number, default: 0 },
    tipoIva: { type: Number, default: 0 }, // Ej: 21, 10, 4
    ivaCuota: { type: Number, default: 0 },
    tipo: { type: String, enum: ['Ingreso', 'Gasto'], required: true },
    esAdministracion: { type: Boolean, default: false },

    // VINCULACIÓN CON CAJA O BANCO
    metodoPago: { type: String, enum: ['Transferencia', 'Efectivo', 'Domiciliación', 'Tarjeta'], default: 'Transferencia' },
    cuentaBanco: { type: mongoose.Schema.Types.ObjectId, ref: 'Banco' },
    cuentaCaja: { type: mongoose.Schema.Types.ObjectId, ref: 'Caja' },

    proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
    // Campos nuevos para el reparto proporcional:
    comunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Comunidad' },
    propiedad: { type: mongoose.Schema.Types.ObjectId, ref: 'Propiedad' },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'Propietario' },
    banco: { type: mongoose.Schema.Types.ObjectId, ref: 'Banco' }
}, { timestamps: true });

// Exportación correcta para TypeScript
export default mongoose.models.Movimiento || mongoose.model('Movimiento', movimientoSchema);
