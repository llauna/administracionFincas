import React from 'react';
import {Container, Card, Row, Col, Button, Alert} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Perfil: React.FC = () => {
    const navigate = useNavigate();
    // Recuperamos los datos del usuario del localStorage (guardados al hacer login)
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user) {
        return <Container className="mt-4"><Alert variant="warning">No se ha encontrado información de sesión.</Alert></Container>;
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Mi Perfil</h2>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>Volver</Button>
            </div>
            <Card className="shadow-sm">
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={4} className="fw-bold">Nombre de Usuario:</Col>
                        <Col md={8}>{user.username || user.nombre || 'No definido'}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={4} className="fw-bold">Email:</Col>
                        <Col md={8}>{user.email}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={4} className="fw-bold">Rol en el sistema:</Col>
                        <Col md={8} className="text-capitalize">{user.role || 'Usuario'}</Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Perfil;