import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { IncidenciaService } from '../../services/IncidenciaService';
import { ComunidadService } from '../../services/ComunidadService';
import { useAuth } from '../../context/useAuth';
import { toast } from 'react-toastify';

const NuevaIncidencia = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [comunidades, setComunidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcionDetallada: '',
        gravedadImpacto: 'Media',
        comunidad: '',
        ubicacionEspecifica: '',
        reportadoPor: {
            nombre: user?.nombreCompleto || '',
            contacto: user?.email || ''
        }
    });

    useEffect(() => {
        const cargarComunidades = async () => {
            try {
                const data = await ComunidadService.getAll();
                setComunidades(data);
                // Si solo hay una comunidad (caso de un cliente), seleccionarla por defecto
                if (data.length === 1) {
                    setFormData(prev => ({ ...prev, comunidad: data[0]._id }));
                }
            } catch (error) {
                console.error("Error cargando comunidades", error);
            }
        };
        cargarComunidades();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...(prev as any)[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError(null); // Limpiar errores previos
            try {
                await IncidenciaService.create(formData);
                toast.success('Incidencia reportada correctamente');
                navigate('/incidencias');
            } catch (error: any) {
                setError(error.response?.data?.message || 'Error al crear la incidencia');
                toast.error('Error al crear la incidencia');
            } finally {
                setLoading(false);
            }
        };


        return (
            <Container className="mt-4">
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-primary text-white py-3">
                        <h4 className="mb-0">Reportar Nueva Incidencia</h4>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {error && (
                            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-4">
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Título de la Incidencia</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="titulo"
                                            placeholder="Ej: Avería en ascensor, Fuga de agua..."
                                            value={formData.titulo}
                                            onChange={handleChange}
                                            required
                                            className="form-control-lg"
                                        />
                                        <Form.Text className="text-muted">Resume el problema en pocas palabras.</Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Gravedad</Form.Label>
                                        <Form.Select
                                            name="gravedadImpacto"
                                            value={formData.gravedadImpacto}
                                            onChange={handleChange}
                                            className="form-control-lg"
                                        >
                                            <option value="Baja">🟢 Baja</option>
                                            <option value="Media">🟡 Media</option>
                                            <option value="Alta">🟠 Alta</option>
                                            <option value="Crítica">🔴 Crítica</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Comunidad</Form.Label>
                                        <Form.Select
                                            name="comunidad"
                                            value={formData.comunidad}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecciona una comunidad...</option>
                                            {comunidades.map((c: any) => (
                                                <option key={c._id} value={c._id}>{c.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Ubicación Específica</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ubicacionEspecifica"
                                            placeholder="Ej: Planta 2, Portal B..."
                                            value={formData.ubicacionEspecifica}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Descripción Detallada</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    name="descripcionDetallada"
                                    placeholder="Describe el problema, cuándo ocurrió y cualquier detalle relevante..."
                                    value={formData.descripcionDetallada}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <hr className="my-4" />

                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => navigate('/incidencias')}>
                                    Volver al Listado
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading} className="px-4">
                                    {loading ? 'Enviando...' : 'Registrar Incidencia'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        );
};

export default NuevaIncidencia;