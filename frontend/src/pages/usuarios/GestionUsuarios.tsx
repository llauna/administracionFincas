import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const GestionUsuarios: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Gestión de Usuarios</h2>
            <Row>
                {/* Opción para Propietarios */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-primary">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Alta de Propietarios</Card.Title>
                            <Card.Text>
                                Registra un nuevo propietario. Podrás dar de alta su comunidad y su propiedad en un mismo flujo de trabajo.
                            </Card.Text>
                            <Button
                                variant="primary"
                                className="mt-auto"
                                onClick={() => navigate('/propietarios/nuevo')}
                            >
                                Ir a Alta de Propietario
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Opción para Empleados */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 shadow-sm border-success">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Alta de Empleados</Card.Title>
                            <Card.Text>
                                Gestiona el personal de la administración. Registra nuevos empleados para el sistema de gestión.
                            </Card.Text>
                            <Button
                                variant="success"
                                className="mt-auto"
                                onClick={() => navigate('/personal/nuevo')}
                            >
                                Ir a Alta de Empleado
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Opción para Listado de Usuarios */}
                <Col md={4} className="mb-4">
                    <Card className="h-100 shadow-sm border-info">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>Listado de Usuarios</Card.Title>
                            <Card.Text>
                                Visualiza y gestiona todos los usuarios del sistema, incluyendo empleados y propietarios.
                            </Card.Text>
                            <Button
                                variant="info"
                                className="mt-auto text-white"
                                onClick={() => navigate('/usuarios/listado')}
                            >
                                Ver Listado Completo
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <div className="mt-2">
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>Volver al Panel</Button>
            </div>
        </Container>
    );
};

export default GestionUsuarios;