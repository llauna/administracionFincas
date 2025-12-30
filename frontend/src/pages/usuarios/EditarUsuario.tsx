import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {Col, Form, Row} from "react-bootstrap";
import {UserService} from "../../services/UserService";

interface User {
    _id: string;
    nombreCompleto: string;
    email: string;
    role: "admin" | "editor" | "viewer";
    puesto: string;
    departamento: string;
    fechaContratacion: string;
    telefono: string;
    direccion: string;
    tipo: 'usuario' | 'empleado' | 'propietario';
    isActive?: boolean;
}

const EditarUsuario = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const tipoQuery = searchParams.get('tipo') || 'usuario';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Corregido el nombre
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUsuario = async () => {
            try {
                if (id) {
                    const data = await UserService.getById(id) as any;
                    if (data && data.fechaContratacion) {
                        data.fechaContratacion = data.fechaContratacion.split('T')[0];
                    }
                    setUser(data);
                }
            } catch (err) {
                setError('No se pudo cargar el usuario');
            } finally {
                setLoading(false);
            }
        };
        void loadUsuario();
    }, [id]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) return;

        const token = localStorage.getItem('token'); // Recuperamos el token directamente

        try {
            const userData = {
                ...user,
                tipo: user.tipo || tipoQuery
            };
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`, // Lo enviamos explícitamente
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
            });

            if (res.status === 401) {
                throw new Error("Tu sesión ha expirado. Por favor, vuelve a entrar.");
            }

            if (!res.ok) throw new Error("Error al guardar cambios");
            navigate("/usuarios/listado");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        }
    };

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (loading || !user) return <p>Cargando...</p>;

    return (
        <div className="container mt-4" style={{ maxWidth: "700px" }}>
            <h1 className="mb-4">Editar Usuario</h1>

            <Form onSubmit={handleSave}>
                <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                        <Form.Label>Nombre Completo</Form.Label>
                        <Form.Control
                            type="text"
                            value={user.nombreCompleto || ''}
                            onChange={e => setUser({...user, nombreCompleto: e.target.value})}
                            required
                        />
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                        <Form.Label>Tipo de Usuario</Form.Label>
                        <Form.Select
                            value={user.tipo || ''}
                            onChange={e => setUser({...user, tipo: e.target.value as any})}
                            required
                        >
                            <option value="">Seleccione tipo...</option>
                            <option value="empleado">Empleado</option>
                            <option value="usuario">Usuario / Cliente</option>
                            <option value="propietario">Propietario</option>
                        </Form.Select>
                    </Form.Group>
                </Row>

            <div className="mb-3">
                <label>Email</label>
                <input
                    type="email" className="form-control"
                    value={user.email} disabled />
                <small className="text-muted">El email no puede ser modificado</small>
            </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email" className="form-control bg-light"
                        value={user.email} disabled />
                    <small className="text-muted">El email no puede ser modificado</small>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Puesto</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user.puesto || ''}
                            onChange={(e) => setUser({ ...user, puesto: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Departamento</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user.departamento || ''}
                            onChange={(e) => setUser({ ...user, departamento: e.target.value })}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>Fecha de contratación</label>
                        <input
                            type="date"
                            className="form-control"
                            value={user.fechaContratacion?.split("T")[0]}
                            onChange={(e) => setUser({ ...user, fechaContratacion: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Teléfono</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user.telefono}
                            onChange={(e) => setUser({ ...user, telefono: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label>Dirección</label>
                    <input
                        type="text"
                        className="form-control"
                        value={user.direccion}
                        onChange={(e) => setUser({ ...user, direccion: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <label>Rol</label>
                    <select
                        className="form-select"
                        value={user.role}
                        onChange={(e) => setUser({ ...user, role: e.target.value as User["role"] })}
                    >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-secondary" onClick={() => navigate("/usuarios/listado")}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        Guardar Cambios
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default EditarUsuario;
