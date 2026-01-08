import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { PropiedadService } from '../../services/PropiedadService';

const EditarPropiedad: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Un solo estado formData con todos los campos necesarios
    const [formData, setFormData] = useState({
        tipo: 'piso',
        direccion: '',
        referencia: '',
        piso: '',
        puerta: '',
        portal: '',
        metrosCuadrados: 0,
        estado: 'disponible'
    });

    // Un solo efecto para cargar los datos
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

    // Función handleChange que faltaba
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'metrosCuadrados' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await PropiedadService.update(id, formData as any);
                navigate('/propiedades');
            }
        } catch (err) {
            setError('Error al actualizar la propiedad');
            console.error(err);
        }
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p>Cargando datos de la propiedad...</p>
        </Container>
    );

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header as="h5">Editar Propiedad</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo</Form.Label>
                                    <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
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
                                <Form.Group className="mb-3">
                                    <Form.Label>Referencia Catastral</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="referencia"
                                        value={formData.referencia}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Portal</Form.Label>
                                    <Form.Control type="text" name="portal" value={formData.portal} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Piso</Form.Label>
                                    <Form.Control type="text" name="piso" value={formData.piso} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Puerta</Form.Label>
                                    <Form.Control type="text" name="puerta" value={formData.puerta} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select name="estado" value={formData.estado} onChange={handleChange}>
                                        <option value="disponible">Disponible</option>
                                        <option value="alquilado">Ocupado / Alquilado</option>
                                        <option value="en_mantenimiento">Mantenimiento</option>
                                        <option value="baja">Baja</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
                            <Button variant="primary" type="submit">Actualizar Propiedad</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditarPropiedad;