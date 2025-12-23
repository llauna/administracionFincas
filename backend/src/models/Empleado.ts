import mongoose from 'mongoose';

const EmpleadoSchema = new mongoose.Schema({
    idAdministradorFincas: { type: mongoose.Schema.Types.ObjectId, ref: 'AdministradorFincas', required: true },
    nombre:      { type: String, required: true },
    apellidos:   { type: String, required: true },
    direccion:   { type: String, required: true },
    poblacion:   { type: String, required: true },
    cp:          { type: String, required: true },
    dni:         { type: String, required: true, unique: true },
    cta_cte:     { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaBaja:   { type: Date }
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);
