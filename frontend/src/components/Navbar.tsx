import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/Navbar.css";
import logo from "../assets/fincas.jpg";

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper function to check user role
    const hasRole = (roleToCheck: string) => {
        return user?.role === roleToCheck || user?.tipo === roleToCheck;
    };

    // If user is not loaded yet, show loading state
    if (!user) {
        return <div className="navbar navbar-expand-lg navbar-dark bg-dark">Cargando...</div>;
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/home">
                    <img src={logo} alt="Logo" width="30" height="30" className="d-inline-block align-text-top" />
                    <span>Administración de Fincas</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {(hasRole('admin') || hasRole('empleado')) ? (
                            // Employee/Admin menu
                            <>
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="inicioDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Inicio
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="inicioDropdown">
                                        <li><Link className="dropdown-item" to="/empresa">Empresa</Link></li>
                                        <li><Link className="dropdown-item" to="/proveedores">Proveedores</Link></li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="gestionDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Gestión
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="gestionDropdown">
                                        <li className="dropdown-submenu">
                                            <Link className="dropdown-item dropdown-toggle" to="#" id="adminDropdown">Administración</Link>
                                            <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                                                <li><Link className="dropdown-item" to="/comunidades">Comunidades</Link></li>
                                                <li><Link className="dropdown-item" to="/propiedades">Propiedades</Link></li>
                                                <li><Link className="dropdown-item" to="/propietarios">Propietarios</Link></li>
                                            </ul>
                                        </li>
                                        <li><Link className="dropdown-item" to="/documentacion/actas">Actas de Reuniones</Link></li>
                                        <li><Link className="dropdown-item" to="/documentacion/estados-financieros">Estados Financieros</Link></li>
                                        <li><Link className="dropdown-item" to="/incidencias">Incidencias</Link></li>
                                        <li className="dropdown-submenu">
                                            <Link className="dropdown-item dropdown-toggle" to="#" id="finanzasDropdown">Finanzas</Link>
                                            <ul className="dropdown-menu" aria-labelledby="finanzasDropdown">
                                                <li><Link className="dropdown-item" to="/caja">Caja</Link></li>
                                                <li><Link className="dropdown-item" to="/banco">Banco</Link></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="usuariosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Usuarios
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="usuariosDropdown">
                                        <li><Link className="dropdown-item" to="/perfil">Perfil</Link></li>
                                        {hasRole('admin') && (
                                            <>
                                                <li><Link className="dropdown-item" to="/usuarios">Gestión de Usuarios</Link></li>
                                                <li><Link className="dropdown-item" to="/configuracion">Configuración</Link></li>
                                            </>
                                        )}
                                    </ul>
                                </li>
                            </>
                        ) : hasRole('cliente') ? (
                            // Client menu
                            <>
                            <li className="nav-item dropdown">
                            <Link className="nav-link dropdown-toggle" to="#" id="gestionClienteDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Gestión
                            </Link>
                            <ul className="dropdown-menu" aria-labelledby="gestionClienteDropdown">
                                <li><Link className="dropdown-item" to="/propiedades">Mis Propiedades</Link></li>
                                <li><Link className="dropdown-item" to={`/incidencias/${user?._id || ''}`}>Mis Incidencias</Link></li>
                            </ul>
                            </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <span className="nav-link text-warning">
                                    No tiene permisos asignados
                                </span>
                            </li>
                        )}
                    </ul>

                    <div className="d-flex">
                        {user ? (
                            <button
                                className="btn btn-danger"
                                onClick={handleLogout}
                                aria-label="Cerrar sesión"
                            >
                                Cerrar Sesión
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-outline-light">
                                <i className="bi bi-box-arrow-right me-1"></i>Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;