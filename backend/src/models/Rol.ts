import mongoose from "mongoose";

const RolSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    permisos: {
        type: [String],
        default: []
    },
    descripcion: {
        type: String,
        required: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Asegurar que no se puedan crear roles duplicados
RolSchema.index({ nombre: 1 }, { unique: true });

module.exports = mongoose.model('Rol', RolSchema);