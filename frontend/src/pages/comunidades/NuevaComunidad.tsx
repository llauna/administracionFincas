import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';

const NuevaComunidad: React.FC = () => {
    return (
        <Container className="mt-4">
            <h2>Nueva Comunidad</h2>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control type="text" placeholder="Nombre de la comunidad" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Dirección completa" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Guardar
                </Button>
            </Form>
        </Container>
    );
};

export default NuevaComunidad;