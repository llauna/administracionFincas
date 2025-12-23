import mongoose from 'mongoose';

const ContratoSchema = new mongoose.Schema({
    idProveedor:           { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
    idAdministradorFincas: { type: mongoose.Schema.Types.ObjectId, ref: 'AdministradorFincas', required: true },
    tipoServicio:          { type: String, required: true },
    fechaInicio:           { type: Date, required: true },
    fechaFin:              { type: Date, required: true },
    coste:                 { type: Number, required: true }
});

module.exports = mongoose.model('Contrato', ContratoSchema);
