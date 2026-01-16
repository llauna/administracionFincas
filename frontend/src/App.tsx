// En App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ToastContainer } from 'react-toastify';
import PrivateRoute from "./router/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Personal from "./pages/usuarios/Personal";
import Footer from "./components/Footer";
import EditarUsuario from './pages/usuarios/EditarUsuario';
import Empresa from "./pages/empresa/Empresa";
import Perfil from "./pages/usuarios/Perfil";
import GestionUsuarios from "./pages/usuarios/GestionUsuarios";
import ListadoUsuarios from "./pages/usuarios/ListadoUsuarios";
import NuevoUsuario from "./pages/usuarios/NuevoUsuario";
import Comunidades from "./pages/comunidades/Comunidades";
import Propiedades from "./pages/propiedades/Propiedades";
import NuevaPropiedad from "./pages/propiedades/NuevaPropiedad";
import EditarPropiedad from "./pages/propiedades/EditarPropiedad";
import EditarComunidad from "./pages/comunidades/EditarComunidad";
import NuevaComunidad from "./pages/comunidades/NuevaComunidad";
import NuevoPropietario from "./pages/propietarios/NuevoPropietario";
import EditarPropietario from "./pages/propietarios/EditarPropietario";
import PropietariosPage from "./pages/propietarios/Propietario";
import GestionProveedores from "./pages/proveedores/GestionProveedores";
import Incidencias from "./pages/incidencias/Incidencias";
import NuevaIncidencia from "./pages/incidencias/NuevaIncidencia";
import DetalleIncidencia from "./pages/incidencias/DetalleIncidencia";
import EstadosFinancieros from './pages/documentacion/EstadosFinancieros';
import LibrosIVA from "./pages/documentacion/LibrosIVA";
import Tesoreria from "./pages/documentacion/Tesoreria";

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastContainer position={"top-right"} autoClose={5000} />                <AppContent />
            </AuthProvider>
        </Router>
    );
}

function AppContent() {
    const { user, loading } = useAuth(); // Usamos 'user' y 'loading' del nuevo contexto

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {user && <Navbar />}
            <div className="main-content">
                <Routes>
                    {/* Redirección inicial */}
                    <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

                    {/* Ruta de Login: si ya está logueado, lo mandamos al dashboard */}
                    <Route path="/login" element={user ? <Navigate to="/dashboard" replace/> : <Login />} />

                    {/* Grupo de Rutas Protegidas */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/empresa" element={<Empresa />} />
                        <Route path="/proveedores" element={<GestionProveedores />} />
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
                        <Route path="/usuarios/listado" element={<ListadoUsuarios />} />

                        <Route path="/documentacion/estados-financieros" element={<EstadosFinancieros />} />
                        <Route path="/documentacion/libros-iva" element={<LibrosIVA />} />
                        <Route path="/tesoreria" element={<Tesoreria />} />

                        <Route path="/incidencias" element={<Incidencias />} />
                        <Route path="/incidencias/nueva" element={<NuevaIncidencia />} />
                        <Route path="/incidencias/:id" element={<DetalleIncidencia />} />

                        <Route path="/comunidades" element={<Comunidades />} />
                        <Route path="/comunidades/nueva" element={<NuevaComunidad />} />
                        <Route path="/comunidades/editar/:id" element={<EditarComunidad />} />

                        <Route path="/propiedades" element={<Propiedades />} />
                        <Route path="/propiedades/nueva" element={<NuevaPropiedad />} />
                        <Route path="/propiedades/editar/:id" element={<EditarPropiedad />} />

                        <Route path="/propietarios/nuevo" element={<NuevoPropietario />} />
                        <Route path="/propietarios" element={<PropietariosPage />} />
                        <Route path="/propietarios/editar/:id" element={<EditarPropietario />} />

                        <Route path="/personal" element={<Personal />} />
                        <Route path="/personal/nuevo" element={<NuevoUsuario />} />
                        <Route path="/personal/editar/:id" element={<EditarUsuario />} />
                    </Route>

                    {/* Catch-all para rutas no encontradas */}
                    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </div>
            <Footer />
        </>
    );
}

export default App;