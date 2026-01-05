// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface User {
    tipo: 'empleado' | 'cliente';
    _id?: string;
    [key: string]: any;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!storedToken) {
                navigate('/login');
                return;
            }

            if (!storedUser) {
                setError('No se encontró la información del usuario');
                setIsLoading(false);
                return;
            }

            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
                setError('Error al cargar la información del usuario');
                // Limpiar datos inválidos
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando tu perfil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <div className="mt-3">
                        <button onClick={handleLogout} className="btn btn-outline-danger">
                            Volver al inicio de sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    No se pudo cargar la información del usuario.
                    <div className="mt-2">
                        <button onClick={handleLogout} className="btn btn-outline-warning">
                            Volver a intentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Bienvenido al Panel de Control</h2>
                            <p className="card-text">
                                Aquí podrás gestionar todas las funcionalidades de la aplicación.
                            </p>
                            <div className="row mt-4">
                                {user?.tipo === 'empleado' && (
                                    <>
                                        <div className="col-md-4 mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title">Gestión de Propiedades</h5>
                                                    <p className="card-text">Administra las propiedades de la comunidad.</p>
                                                    <Link to="/propiedades" className="btn btn-primary">
                                                        Ir a Propiedades
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title">Incidencias</h5>
                                                    <p className="card-text">Gestiona las incidencias reportadas.</p>
                                                    <Link to="/incidencias" className="btn btn-primary">
                                                        Ver Incidencias
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title">Documentación</h5>
                                                    <p className="card-text">Accede a la documentación de la comunidad.</p>
                                                    <Link to="/documentacion" className="btn btn-primary">
                                                        Ver Documentos
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {user?.tipo === 'cliente' && (
                                    <>
                                        <div className="col-md-6 mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title">Mis Propiedades</h5>
                                                    <p className="card-text">Consulta la información de tus propiedades.</p>
                                                    <Link to="/propiedades" className="btn btn-primary">
                                                        Ver Mis Propiedades
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title">Mis Incidencias</h5>
                                                    <p className="card-text">Revisa el estado de tus incidencias.</p>
                                                    <Link to="/incidencias" className="btn btn-primary">
                                                        Ver Mis Incidencias
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;