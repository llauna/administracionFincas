import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PropiedadService } from '../../services/PropiedadService';
import { ComunidadService } from '../../services/ComunidadService';
import { PropietarioService } from '../../services/PropietarioService';

const NuevaPropiedad: React.FC = () => {
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState('');

    const [comunidades, setComunidades] = useState<any[]>([]);
    const [propietarios, setPropietarios] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        tipo: 'piso',
        direccion: '',
        numero: '',
        piso: '',
        puerta: '',
        comunidad: '',
        propietario: '',
        coeficiente: 0
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [coms, props] = await Promise.all([
                    ComunidadService.getAll(),
                    PropietarioService.getAll()
                ]);
                setComunidades(coms);
                setPropietarios(props);
            } catch (err) {
                setError('Error al cargar datos auxiliares');
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            await PropiedadService.create(formData as any);
            navigate('/propiedades');
        } catch (err: any) {
            setError(err.message || 'Error al crear la propiedad');
        }
    };

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header as="h5">Registrar Nueva Propiedad</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Comunidad</Form.Label>
                                <Form.Select
                                    required
                                    value={formData.comunidad}
                                    onChange={e => setFormData({...formData, comunidad: e.target.value})}
                                >
                                    <option value="">Seleccionar comunidad...</option>
                                    {comunidades.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="6">
                                <Form.Label>Propietario</Form.Label>
                                <Form.Select
                                    required
                                    value={formData.propietario}
                                    onChange={e => setFormData({...formData, propietario: e.target.value})}
                                >
                                    <option value="">Seleccionar propietario...</option>
                                    {propietarios.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="4">
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                                    <option value="piso">Piso</option>
                                    <option value="local">Local</option>
                                    <option value="garaje">Garaje</option>
                                    <option value="trastero">Trastero</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md="8">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={formData.direccion}
                                    onChange={e => setFormData({...formData, direccion: e.target.value})}
                                />
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                            <Button variant="primary" type="submit" className="me-3">
                                Guardar Propiedad
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/propiedades')} className="me-2">
                                Volver
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/propiedades')}>
                                Cancelar
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NuevaPropiedad;