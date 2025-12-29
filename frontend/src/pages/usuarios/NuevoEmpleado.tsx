import React, { useState } from 'react';
import {Container, Form, Button, Alert, Card, Spinner} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { EmpleadoService } from '../../services/EmpleadoService';
import { useAuth } from '../../context/AuthContext';

interface EmpleadoFormData {
    nombre: string;
    dni: string;
    email: string;
    puesto: string;
    password: string;
    rol?: string;
}

const NuevoEmpleado: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<EmpleadoFormData>({
        nombre: '',
        dni: '',
        email: '',
        puesto: '',
        password: '',
        rol: 'empleado'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const empleadoData = {
                nombre: formData.nombre,
                dni: formData.dni,
                email: formData.email,
                puesto: formData.puesto,
                password: formData.password,
                role: formData.rol || 'empleado',
                creadoPor: user?._id,
                fechaCreacion: new Date().toISOString()
            };

            console.log('Enviando datos:', empleadoData);

            const response = await EmpleadoService.create(empleadoData);

            if (response && (response.id || response._id)) {
                alert('Empleado creado exitosamente');
                navigate('/gestion-usuarios');
            } else {
                throw new Error('No se pudo crear el empleado. Intente nuevamente.');
            }
        } catch (err: any) {
            console.error('Error al crear empleado:', err);
            setError(err.message || 'Error al crear el empleado. Verifique los datos e intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Nuevo Empleado</h2>
            <Card>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formNombre">
                            <Form.Label>Nombre Completo</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Nombre completo del empleado"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDni">
                            <Form.Label>DNI/NIE</Form.Label>
                            <Form.Control
                                type="text"
                                name="dni"
                                value={formData.dni}
                                onChange={handleChange}
                                required
                                placeholder="Documento de identidad"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPuesto">
                            <Form.Label>Puesto</Form.Label>
                            <Form.Control
                                type="text"
                                name="puesto"
                                value={formData.puesto}
                                onChange={handleChange}
                                required
                                placeholder="Puesto de trabajo"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="email@ejemplo.com"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese una contraseña segura"
                            />
                        </Form.Group>

                        {user?.role === 'admin' && (
                            <Form.Group className="mb-3" controlId="formRol">
                                <Form.Label>Rol</Form.Label>
                                <Form.Select
                                    name="rol"
                                    value={formData.rol || 'empleado'}
                                    onChange={handleSelectChange}
                                    required
                                >
                                    <option value="empleado">Empleado</option>
                                    <option value="admin">Administrador</option>
                                </Form.Select>
                            </Form.Group>
                        )}

                        <div className="d-flex justify-content-between">
                            <Button
                                variant="secondary"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Creando...
                                    </>
                                ) : 'Crear Empleado'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NuevoEmpleado;