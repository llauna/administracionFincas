// src/router/index.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Login from "../pages/Login";

import EditarUsuario from "../pages/usuarios/EditarUsuario";
import NuevoUsuario from "../pages/usuarios/NuevoUsuario";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "../context/useAuth";
import React from "react";

function AppRoutes() {
    const { user } = useAuth();
    const location = useLocation();

    // El Navbar se muestra si hay usuario y no estamos en el login
    const showNavbar = user && location.pathname !== "/login";

    return (
        <>
            {showNavbar && <Navbar />}
            <Routes>
                {/* Rutas Públicas */}
                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" replace /> : <Login />}
                />

                {/* Rutas Protegidas (Todas dentro de un solo PrivateRoute) */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/personal/nuevo" element={<NuevoUsuario />} />
                    <Route path="/personal/editar/:id" element={<EditarUsuario />} />
                    {/* Agrega aquí más rutas que necesiten login */}
                </Route>

                {/* Redirecciones y errores */}
                <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default function AppRouter() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}
