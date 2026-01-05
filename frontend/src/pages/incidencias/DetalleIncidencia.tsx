import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { IncidenciaService } from '../../services/IncidenciaService';
import { useAuth } from '../../context/useAuth';
import { toast } from 'react-toastify';

const DetalleIncidencia = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [incidencia, setIncidencia] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isEmployee = hasRole(['admin', 'empleado']);

    useEffect(() => {
        if (id) cargarDetalle();
    }, [id]);

    const cargarDetalle = async () => {
        try {
            const data = await IncidenciaService.getById(id!);
            setIncidencia(data);
        } catch (error) {
            toast.error("Error al cargar la incidencia");
        } finally {
            setLoading(false);
        }
    };

    const handleEstadoChange = async (nuevoEstado: string) => {
        try {
            await IncidenciaService.update(id!, { estado: nuevoEstado });
            toast.success(`Estado actualizado a ${nuevoEstado}`);
            cargarDetalle();
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (!incidencia) return <Container className="mt-5"><Badge bg="danger">No se encontró la incidencia</Badge></Container>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Detalle de Incidencia #{incidencia._id.substring(18)}</h2>
                <Button variant="secondary" onClick={() => navigate('/incidencias')}>Volver</Button>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h4 className="border-bottom pb-2">{incidencia.titulo}</h4>
                            <p className="mt-3"><strong>Descripción:</strong></p>
                            <p className="bg-light p-3 rounded">{incidencia.descripcionDetallada}</p>

                            <Row className="mt-4">
                                <Col sm={6}>
                                    <p><strong>Comunidad:</strong> {incidencia.comunidad?.nombre}</p>
                                    <p><strong>Ubicación:</strong> {incidencia.ubicacionEspecifica}</p>
                                </Col>
                                <Col sm={6}>
                                    <p><strong>Reportado por:</strong> {incidencia.reportadoPorUsuarioId?.nombreCompleto}</p>
                                    <p><strong>Fecha:</strong> {new Date(incidencia.fechaHoraReporte).toLocaleString()}</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-primary">
                        <Card.Header className="bg-primary text-white text-center fw-bold">Gestión de Estado</Card.Header>
                        <Card.Body>
                            <div className="text-center mb-4">
                                <p className="mb-1 text-muted text-uppercase small fw-bold">Estado Actual</p>
                                <h3><Badge bg={incidencia.estado === 'Resuelta' ? 'success' : 'warning'}>{incidencia.estado}</Badge></h3>
                            </div>

                            {isEmployee && (
                                <Form.Group>
                                    <Form.Label className="fw-bold">Cambiar Estado:</Form.Label>
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="outline-warning"
                                            disabled={incidencia.estado === 'En Proceso'}
                                            onClick={() => handleEstadoChange('En Proceso')}
                                        >
                                            Marcar En Proceso
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            disabled={incidencia.estado === 'Resuelta'}
                                            onClick={() => handleEstadoChange('Resuelta')}
                                        >
                                            Marcar como Resuelta
                                        </Button>
                                        <Button
                                            variant="outline-dark"
                                            disabled={incidencia.estado === 'Cerrada'}
                                            onClick={() => handleEstadoChange('Cerrada')}
                                        >
                                            Cerrar Incidencia
                                        </Button>
                                    </div>
                                </Form.Group>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DetalleIncidencia;