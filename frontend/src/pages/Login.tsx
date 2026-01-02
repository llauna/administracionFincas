import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { login as loginService } from "../services/auth";
import candado from "../assets/candado.svg";



const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // Usamos el servicio centralizado
            const data = await loginService(email, password);

            if (data.token && data.user) {
                // Normalización más robusta
                let finalRole = data.user.role || data.user.tipo || 'cliente';

                // Si el backend envía 'viewer' o es tipo 'propietario', lo mapeamos a 'cliente' para el Navbar
                if (finalRole === 'viewer' || data.user.tipo === 'propietario') {
                    finalRole = 'cliente';
                }
                // Normalización de datos del usuario
                const userData = {
                    ...data.user,
                    role: data.user.role || data.user.tipo || 'cliente',
                    tipo: data.user.tipo || data.user.role || 'cliente'
                };

                localStorage.setItem('user', JSON.stringify(userData));

                // Actualizamos el contexto de autenticación
                login(userData);
                navigate('/dashboard');
            } else {
                throw new Error('Datos de usuario no recibidos');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="text-center mb-3">
                    <img src={candado} alt="Candado" style={{ width: "80px" }} />
                </div>
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Entrar
                    </button>
                </form>
                {error && (
                    <div className="mt-3 alert alert-danger">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
