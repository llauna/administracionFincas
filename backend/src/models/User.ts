import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: string;
    nombre?: string;
    apellidos?: string;
    nombreCompleto: string;
    tipo?: string;
    isActive?: boolean;
    puesto: string;
    departamento: string;
    fechaContratacion: Date;
    telefono?: string;
    direccion?: string;
    createdAt: Date;
    lastLogin?: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'empleado' },
    nombreCompleto: { type: String, required: true },
    tipo: { type: String, default: 'usuario' },
    puesto: { type: String, required: true },
    departamento: { type: String, required: true },
    fechaContratacion: { type: Date, required: true },
    telefono: { type: String },
    direccion: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

export default mongoose.model<IUser>('User', UserSchema);


