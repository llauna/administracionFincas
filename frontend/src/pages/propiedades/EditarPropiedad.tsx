import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { PropiedadService } from '../../services/PropiedadService';

const EditarPropiedad: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        tipo: 'piso',
        direccion: '',
        referencia: '',
        piso: '',
        puerta: '',
        portal: '',
        coeficiente: 0,
        metrosCuadrados: 0,
        estado: 'disponible'
    });

    useEffect(() => {
        const fetchPropiedad = async () => {
            if (!id) return;
            try {
                const data = await PropiedadService.getById(id);
                if (data) {
                    setFormData({
                        tipo: data.tipo || 'piso',
                        direccion: data.direccion || '',
                        referencia: data.referencia || '',
                        piso: data.piso || '',
                        puerta: data.puerta || '',
                        portal: (data as any).portal || '',
                        coeficiente: data.coeficiente || 0,
                        metrosCuadrados: data.metrosCuadrados || 0,
                        estado: data.estado || 'disponible'
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Error al cargar la propiedad');
            } finally {
                setLoading(false);
            }
        };
        fetchPropiedad();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'metrosCuadrados' || name === 'coeficiente') ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await PropiedadService.update(id, formData as any);
                navigate(-1); // Volvemos a la pantalla anterior (la de comunidad)
            }
        } catch (err) {
            setError('Error al actualizar la propiedad');
        }
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
        </Container>
    );

    return (
        <Container fluid className="px-4 mt-2">
            <Card className="shadow-sm">
                <Card.Header className="bg-white py-2">
                    <h5 className="mb-0 text-primary small font-weight-bold">Editar Propiedad</h5>
                </Card.Header>
                <Card.Body className="py-2">
                    {error && <Alert variant="danger" className="py-1 small">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="g-2">
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Tipo</Form.Label>
                                    <Form.Select size="sm" name="tipo" value={formData.tipo} onChange={handleChange}>
                                        <option value="piso">Piso</option>
                                        <option value="local">Local</option>
                                        <option value="garaje">Garaje</option>
                                        <option value="trastero">Trastero</option>
                                        <option value="casa">Casa</option>
                                        <option value="otro">Otro</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Referencia Catastral</Form.Label>
                                    <Form.Control
                                        size="sm" type="text" name="referencia" value={formData.referencia}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-2">
                            <Form.Label className="small mb-1">Dirección</Form.Label>
                            <Form.Control
                                size="sm" type="text" name="direccion" value={formData.direccion}
                                onChange={handleChange} required
                            />
                        </Form.Group>

                        <Row className="g-2">
                            <Col md={2}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Portal</Form.Label>
                                    <Form.Control size="sm" type="text" name="portal" value={formData.portal} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Piso</Form.Label>
                                    <Form.Control size="sm" type="text" name="piso" value={formData.piso} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Puerta</Form.Label>
                                    <Form.Control size="sm" type="text" name="puerta" value={formData.puerta} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Coeficiente (%)</Form.Label>
                                    <Form.Control
                                        size="sm" type="number" step="0.01" name="coeficiente"
                                        value={formData.coeficiente} onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small mb-1">Estado</Form.Label>
                                    <Form.Select size="sm" name="estado" value={formData.estado} onChange={handleChange}>
                                        <option value="disponible">Disponible</option>
                                        <option value="alquilado">Alquilado</option>
                                        <option value="ocupado">Ocupado</option>
                                        <option value="en_mantenimiento">Mantenimiento</option>
                                        <option value="baja">Baja</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>Volver</Button>
                            <Button variant="primary" size="sm" type="submit">Actualizar</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditarPropiedad;