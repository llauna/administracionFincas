import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { PropiedadService } from '../../services/PropiedadService';

const EditarPropiedad: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        const loadPropiedad = async () => {
            try {
                if (id) {
                    const data = await PropiedadService.getById(id);
                    setFormData(data);
                }
            } catch (err) {
                setError('No se pudo cargar la propiedad');
            } finally {
                setLoading(false);
            }
        };
        void loadPropiedad();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                await PropiedadService.update(id, formData);
                navigate('/propiedades');
            }
        } catch (err) {
            setError('Error al actualizar la propiedad');
        }
    };

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header as="h5">Editar Propiedad</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4">
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select
                                    value={formData?.tipo || 'piso'}
                                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                                >
                                    <option value="piso">Piso</option>
                                    <option value="local">Local</option>
                                    <option value="garaje">Garaje</option>
                                    <option value="trastero">Trastero</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="8">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData?.direccion || ''}
                                    onChange={e => setFormData({...formData, direccion: e.target.value})}
                                    required
                                />
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => navigate('/propiedades')}>Volver</Button>
                            <Button variant="primary" type="submit">Actualizar</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditarPropiedad;