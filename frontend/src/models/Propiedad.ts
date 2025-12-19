// src/models/Propiedad.ts
import { Schema, model, Document } from "mongoose";

export interface IPropiedad extends Document {
    idPropietario: Schema.Types.ObjectId;
    direccion: string;
    numero: string;
    poblacion: string;
    cp: string;
    planta: string;
    coeficiente: number;
}

const PropiedadSchema = new Schema<IPropiedad>({
    idPropietario: { type: Schema.Types.ObjectId, ref: "Propietario", required: true },
    direccion:     { type: String, required: true },
    numero:        { type: String, required: true },
    poblacion:     { type: String, required: true },
    cp:            { type: String, required: true },
    planta:        { type: String, required: true },
    coeficiente:   { type: Number, required: true }
});

export const Propiedad = model<IPropiedad>("Propiedad", PropiedadSchema);
