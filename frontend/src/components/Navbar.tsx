import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../assets/styles/Navbar.css";
import logo from "../assets/fincas.jpg";

const Navbar: React.FC = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        Cargando...
                    </Link>
                </div>
            </nav>
        );
    }

    const isAdmin = hasRole('admin');
    const isEmployee = hasRole('empleado');
    const isClient = hasRole(['cliente', 'viewer', 'propietario']);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/dashboard">
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
                        {(isAdmin || isEmployee) && (
                            <>
                                {/* Menú Inicio */}
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="inicioDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Inicio
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="inicioDropdown">
                                        <li><Link className="dropdown-item" to="/empresa">Empresa</Link></li>
                                        {isAdmin && <li><Link className="dropdown-item" to="/proveedores">Proveedores</Link></li>}
                                    </ul>
                                </li>

                                {/* Menú Gestión */}
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="gestionDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Gestión
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="gestionDropdown">
                                        <li className="dropdown-submenu">
                                            <span className="dropdown-item dropdown-toggle">Administración ▸</span>
                                            <ul className="dropdown-menu">
                                                <li><Link className="dropdown-item" to="/comunidades">Comunidades</Link></li>
                                                <li><Link className="dropdown-item" to="/propiedades">Propiedades</Link></li>
                                                <li><Link className="dropdown-item" to="/propietarios">Propietarios</Link></li>
                                            </ul>
                                        </li>
                                        <li><Link className="dropdown-item" to="/documentacion/actas">Actas de Reuniones</Link></li>
                                        <li><Link className="dropdown-item" to="/documentacion/estados-financieros">Estados Financieros</Link></li>
                                        <li><Link className="dropdown-item" to="/incidencias">Incidencias</Link></li>
                                        <li className="dropdown-submenu">
                                            <span className="dropdown-item dropdown-toggle">Finanzas ▸</span>
                                            <ul className="dropdown-menu">
                                                <li><Link className="dropdown-item" to="/caja">Caja</Link></li>
                                                <li><Link className="dropdown-item" to="/banco">Banco</Link></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>

                                {/* Menú Usuarios */}
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="usuariosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Usuarios
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="usuariosDropdown">
                                        <li><Link className="dropdown-item" to="/perfil">Perfil</Link></li>
                                        {isAdmin && (
                                            <>
                                                <li><Link className="dropdown-item" to="/gestion-usuarios">Gestión de Usuarios</Link></li>
                                                <li><Link className="dropdown-item" to="/configuracion">Configuración</Link></li>
                                            </>
                                        )}
                                    </ul>
                                </li>
                            </>
                        )}

                        {isClient && (
                            <>
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="gestionClienteDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Gestión
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="gestionClienteDropdown">
                                        <li><Link className="dropdown-item" to="/propiedades">Mis Propiedades</Link></li>
                                        <li><Link className="dropdown-item" to={`/incidencias/${user?._id || '#'}`}>Mis Incidencias</Link></li>
                                    </ul>
                                </li>

                                {/* Añadimos el menú de Perfil para el cliente */}
                                <li className="nav-item">
                                    <Link className="nav-link" to="/perfil">Mi Perfil</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <Link className="nav-link dropdown-toggle" to="#" id="documentacionDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Documentación
                                    </Link>
                                    <ul className="dropdown-menu" aria-labelledby="documentacionDropdown">
                                        <li><Link className="dropdown-item" to="/documentacion/actas">Actas de Reuniones</Link></li>
                                        <li><Link className="dropdown-item" to="/documentacion/estados-financieros">Estados Financieros</Link></li>
                                    </ul>
                                </li>
                            </>
                        )}

                        {!(isAdmin || isEmployee || isClient) && (
                            <li className="nav-item">
                                <span className="nav-link text-warning">
                                    No tiene permisos asignados
                                </span>
                            </li>
                        )}
                    </ul>

                    <div className="d-flex">
                        <button
                            className="btn btn-danger"
                            onClick={handleLogout}
                            aria-label="Cerrar sesión"
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;