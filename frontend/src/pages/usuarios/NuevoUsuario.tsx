import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmpleadoService } from '../../services/EmpleadoService';

interface User {
    username: string;
    nombreCompleto: string;
    email: string;
    role: "admin" | "editor" | "viewer" | "empleado";
    puesto: string;
    departamento: string;
    fechaContratacion: string;
    telefono: string;
    direccion: string;
    password: string;
    confirmPassword: string;
}

const NuevoUsuario = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User>({
        username: "",
        nombreCompleto: "",
        email: "",
        role: "empleado",
        puesto: "",
        departamento: "",
        fechaContratacion: new Date().toISOString().split('T')[0],
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState<Partial<User>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar el error del campo cuando el usuario empieza a escribir
        if (errors[name as keyof User]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<User> = {};

        if (!user.username.trim()) newErrors.username = "El nombre de usuario es requerido";
        if (!user.nombreCompleto.trim()) newErrors.nombreCompleto = "El nombre completo es requerido";
        if (!user.email) {
            newErrors.email = "El email es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            newErrors.email = "El email no es válido";
        }
        if (!user.password) {
            newErrors.password = "La contraseña es requerida";
        } else if (user.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }
        if (user.password !== user.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const datosUsuario = {
                username: user.username,
                nombre: user.nombreCompleto,
                email: user.email,
                password: user.password,
                role: user.role,
                puesto: user.puesto,
                departamento: user.departamento,
                fechaContratacion: user.fechaContratacion,
                telefono: user.telefono,
                direccion: user.direccion
            };

            const response = await EmpleadoService.create(datosUsuario);

            if (response) {
                alert("Usuario creado con éxito");
                navigate('/gestion-usuarios');
            }
        } catch (error: any) {
            console.error("Error al crear usuario:", error);
            const errorMessage = error.response?.data?.message || "Error al crear el usuario";
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="container py-3" style={{ maxWidth: "600px" }}>
            <h3 className="mb-3">Nuevo Usuario</h3>

            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Nombre de usuario *</label>
                        <input
                            type="text"
                            name="username"
                            className={`form-control form-control-sm ${errors.username ? 'is-invalid' : ''}`}
                            value={user.username}
                            onChange={handleChange}
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Nombre completo *</label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            className={`form-control form-control-sm ${errors.nombreCompleto ? 'is-invalid' : ''}`}
                            value={user.nombreCompleto}
                            onChange={handleChange}
                        />
                        {errors.nombreCompleto && <div className="invalid-feedback">{errors.nombreCompleto}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Email *</label>
                        <input
                            type="email"
                            name="email"
                            className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                            value={user.email}
                            onChange={handleChange}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Rol</label>
                        <select
                            name="role"
                            className="form-select form-select-sm"
                            value={user.role}
                            onChange={handleChange}
                        >
                            <option value="admin">Administrador</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Visualizador</option>
                            <option value="empleado">Empleado</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Contraseña *</label>
                        <input
                            type="password"
                            name="password"
                            className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`}
                            value={user.password}
                            onChange={handleChange}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Confirmar Contraseña *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={`form-control form-control-sm ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            value={user.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Puesto</label>
                        <input
                            type="text"
                            name="puesto"
                            className="form-control form-control-sm"
                            value={user.puesto}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Departamento</label>
                        <input
                            type="text"
                            name="departamento"
                            className="form-control form-control-sm"
                            value={user.departamento}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Teléfono</label>
                        <input
                            type="tel"
                            name="telefono"
                            className="form-control form-control-sm"
                            value={user.telefono}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-bold">Fecha de Contratación</label>
                        <input
                            type="date"
                            name="fechaContratacion"
                            className="form-control form-control-sm"
                            value={user.fechaContratacion}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-bold">Dirección</label>
                        <textarea
                            name="direccion"
                            className="form-control form-control-sm"
                            rows={2}
                            value={user.direccion}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-12 mt-3 d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                        >
                            Guardar Usuario
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NuevoUsuario;