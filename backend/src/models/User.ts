import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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
    puesto: { type: String, required: false },
    departamento: { type: String, required: false },
    fechaContratacion: { type: Date, required: false },
    telefono: { type: String },
    direccion: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

UserSchema.pre<IUser>('save', async function () {
    // 'this' se refiere al documento del usuario
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw error; // Mongoose capturará este error automáticamente
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);


