// En App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./router/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import EditarPropietario from "./pages/propietarios/EditarPropietario";
import Personal from "./pages/usuarios/Personal";
import Footer from "./components/Footer";
import EditarUsuario from './pages/usuarios/EditarUsuario';
import NuevoUsuario from "./pages/usuarios/NuevoUsuario";
import NuevoPropietario from "./pages/propietarios/NuevoPropietario";
import Empresa from "./pages/empresa/Empresa";
import Perfil from "./pages/usuarios/Perfil";

import Comunidades from "./pages/comunidades/Comunidades";
import Propiedades from "./pages/propiedades/Propiedades";
import NuevaPropiedad from "./pages/propiedades/NuevaPropiedad";
import EditarPropiedad from "./pages/propiedades/EditarPropiedad";
import Propietario from "./pages/propietarios/Propietario";
import EditarComunidad from "./pages/comunidades/EditarComunidad";
import NuevaComunidad from "./pages/comunidades/NuevaComunidad";

function AppContent() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            {isAuthenticated && <Navbar />}
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <Login />} />

                    {/* Rutas protegidas */}
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/empresa" element={<PrivateRoute><Empresa /></PrivateRoute>} />
                    <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
                    <Route path="/comunidades" element={<PrivateRoute><Comunidades /></PrivateRoute>} />
                    <Route path="/comunidades/nueva" element={<PrivateRoute><NuevaComunidad /></PrivateRoute>} />
                    <Route path="/comunidades/editar/:id" element={<PrivateRoute><EditarComunidad /></PrivateRoute>} />
                    <Route path="/propiedades" element={<PrivateRoute><Propiedades /></PrivateRoute>} />
                    <Route path="/propiedades/nueva" element={<PrivateRoute><NuevaPropiedad /></PrivateRoute>} />
                    <Route path="/propiedades/editar/:id" element={<PrivateRoute><EditarPropiedad /></PrivateRoute>} />
                    <Route path="/propietarios" element={<PrivateRoute><Propietario /></PrivateRoute>} />
                    <Route path="/propietarios/nuevo" element={<PrivateRoute><NuevoPropietario /></PrivateRoute>} />
                    <Route path="/propietarios/editar/:id" element={<PrivateRoute><EditarPropietario /></PrivateRoute>} />

                    <Route path="/personal" element={<PrivateRoute><Personal /></PrivateRoute>} />
                    <Route path="/personal/nuevo" element={<PrivateRoute><NuevoUsuario /></PrivateRoute>} />
                    <Route path="/personal/editar/:id" element={<PrivateRoute><EditarUsuario /></PrivateRoute>} />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
            <Footer />
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;