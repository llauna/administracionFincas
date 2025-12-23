import { useState } from "react";
import { useNavigate } from "react-router-dom";
import candado from "../assets/candado.svg";
import React from "react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({email, password}),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
                window.location.href = "/dashboard";
                setMensaje("✅ Login correcto");
                navigate("/dashboard");
            } else {
                setMensaje(`❌ ${data.mensaje || "Error en login"}`);
            }
        } catch (err:unknown) {
            const error = err as Error;
            setMensaje(`❌ Error: ${error.message}`);
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
                {mensaje && (
                    <div className="mt-3 alert alert-info">
                        {mensaje}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
