// En App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./router/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Propiedades from "./pages/Propiedades";
import Personal from "./pages/usuarios/Personal";
import Footer from "./components/Footer";
import EditarUsuario from './pages/usuarios/EditarUsuario';
import NuevoUsuario from "./pages/usuarios/NuevoUsuario";

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
                    <Route path="/propiedades" element={<PrivateRoute><Propiedades /></PrivateRoute>} />
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