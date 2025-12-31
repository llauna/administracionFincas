import React, {useEffect, useState} from 'react';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/UserService';
import { toast } from 'react-toastify';
import {PropiedadService} from "../../services/PropiedadService";

const NuevoUsuario: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [propiedades, setPropiedades] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        username: '',
        nombreCompleto: '',
        email: '',
        password: '',
        role: 'viewer',
        tipo: 'usuario', // Valor por defecto para clientes
        puesto: '',
        departamento: '',
        fechaContratacion: new Date().toISOString().split('T')[0],
        telefono: '',
        direccion: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Enviamos el formData completo que ya incluye el campo 'tipo'
            await UserService.create(formData);
            toast.success('Usuario registrado correctamente');
            navigate('/usuarios/listado');
        } catch (err: any) {
            const msg = err.response?.data?.mensaje || 'Error al registrar el usuario';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cargarPropiedades = async () => {
            try {
                const data = await PropiedadService.getAll();
                setPropiedades(data);
            } catch (err) {
                console.error("Error al cargar propiedades");
            }
        };
        cargarPropiedades();
    }, []);


    return (
        <Container className="mt-4" style={{ maxWidth: '800px' }}>
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">Registrar Nuevo Usuario / Empleado</h4>
                </Card.Header>
                <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Nombre Completo</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.nombreCompleto}
                                    onChange={e => setFormData({...formData, nombreCompleto: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6">
                                <Form.Label>Tipo de Usuario</Form.Label>
                                <Form.Select
                                    value={formData.tipo}
                                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                                >
                                    <option value="usuario">Cliente / Usuario General</option>
                                    <option value="empleado">Empleado Interno</option>
                                    <option value="propietario">Propietario</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Email (será el nombre de usuario)</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value, username: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </Form.Group>
                        </Row>

                        {/* Campos específicos para empleados */}
                        {formData.tipo === 'empleado' && (
                            <Row className="mb-3 border rounded p-3 bg-light mx-0">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Puesto / Cargo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.puesto}
                                            onChange={e => setFormData({...formData, puesto: e.target.value})}
                                            placeholder="Ej: Contable"
                                            required={formData.tipo === 'empleado'}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Departamento</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.departamento}
                                            onChange={e => setFormData({...formData, departamento: e.target.value})}
                                            placeholder="Ej: Administración"
                                            required={formData.tipo === 'empleado'}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.telefono}
                                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="6">
                                <Form.Label>Rol en Sistema</Form.Label>
                                <Form.Select
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="viewer">Lector (Solo ver)</option>
                                    <option value="editor">Editor (Puede modificar)</option>
                                    <option value="admin">Administrador (Control total)</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        {formData.tipo === 'usuario' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Vincular con Propiedad</Form.Label>
                                <Form.Select
                                    value={formData.propiedad || ''}
                                    onChange={e => setFormData({...formData, propiedad: e.target.value})}
                                >
                                    <option value="">Seleccione una propiedad...</option>
                                    {propiedades.map(p => (
                                        <option key={p._id} value={p._id}>{p.direccion} ({p.tipo})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Registrando...' : 'Registrar Usuario'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NuevoUsuario;