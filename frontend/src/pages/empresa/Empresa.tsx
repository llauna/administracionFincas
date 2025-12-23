import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const Empresa: React.FC = () => {
    return (
        <Container className="mt-4">
            <h2>Gestión de Empresa</h2>
            <Row className="mt-4">
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Información General</Card.Title>
                            <Card.Text>
                                Gestione la información general de la empresa.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Configuración</Card.Title>
                            <Card.Text>
                                Configure los parámetros de la empresa.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Documentos</Card.Title>
                            <Card.Text>
                                Gestione los documentos de la empresa.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Empresa;