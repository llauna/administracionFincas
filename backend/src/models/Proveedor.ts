import mongoose from 'mongoose';

const facturaSchema = new mongoose.Schema({
    numero: String,
    fecha: Date,
    importe: Number,
    concepto: String,
    archivo: String // ruta o URL del PDF
});

const trabajoSchema = new mongoose.Schema({
    descripcion: { type: String, required: true },
    fechaSolicitud: { type: Date, default: Date.now },
    fechaInicio: Date,
    fechaFin: Date,
    estado: {
        type: String,
        enum: ['Pendiente', 'En progreso', 'Completado', 'Facturado'],
        default: 'Pendiente'
    },
    facturaAsociada: {
        type: String,
        default: 'pendiente'
    },
    comunidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comunidad',
        required: true
    }
});

const proveedorSchema = new mongoose.Schema({
    nif: {
        type: String,
        unique: true,
        sparse: true,  // Allows multiple documents with null/undefined nif
        trim: true
    },
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    poblacion: { type: String, required: true },
    cp: { type: String, required: true },
    tipoServicio: { type: String, required: true },
    actividad: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true },
    facturas: [facturaSchema],
    trabajos: [trabajoSchema]
}, { timestamps: true });

module.exports = mongoose.model('Proveedor', proveedorSchema);
