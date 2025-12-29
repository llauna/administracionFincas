import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Importar path
import authRoutes from './src/routes/auth';
import userRoutes from "./src/routes/userRoutes";
import itemRoutes from "./src/routes/itemRoutes";
import propietarioRoutes from "./src/routes/propietarioRoutes";
import comunidadRoutes from "./src/routes/comunidadRoutes";
import propiedadRoutes from "./src/routes/propiedadRoutes";
import empresaRoutes from "./src/routes/empresaRoutes";
import empleadoRoutes from "./src/routes/empleadoRoutes";
import usuarioRoutes from './src/routes/usuarioRoutes';


// Cargar variables de entorno
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
    credentials: true
}));

app.options('*', cors());

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/propietarios', propietarioRoutes);
app.use('/api/comunidades', comunidadRoutes);
app.use('/api/propiedades', propiedadRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Conexión a BD
// CAMBIO IMPORTANTE: Usamos MONGODB_URI que es lo que tienes en tu .env
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
    console.error("❌ ERROR FATAL: No se encontró MONGODB_URI ni MONGO_URI en las variables de entorno.");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB conectado"))
    .catch(err => console.error("❌ Error al conectar MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));