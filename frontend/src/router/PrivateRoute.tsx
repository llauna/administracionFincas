import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import React from "react";

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    // Mientras el contexto recupera el token del localStorage, mostramos un loader
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }
// Si no hay usuario tras la carga, redirigimos al login
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;