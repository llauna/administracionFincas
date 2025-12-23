import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { ComunidadService } from '../../services/ComunidadService';

const EditarComunidad: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: ''
    });

    useEffect(() => {
        const fetchComunidad = async () => {
            try {
                const data = await ComunidadService.getById(id!);
                setFormData({
                    nombre: data.nombre,
                    direccion: data.direccion
                });
            } catch (err) {
                setError('Error al cargar la comunidad');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComunidad();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ComunidadService.update(id!, formData);
            navigate('/comunidades');
        } catch (err) {
            setError('Error al actualizar la comunidad');
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-4">
            <h2>Editar Comunidad</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="me-3">
                    Guardar Cambios
                </Button>
                <Button variant="secondary" onClick={() => navigate('/comunidades')} className="me-2">
                    Volver
                </Button>
                <Button variant="secondary" onClick={() => navigate('/comunidades')}>
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
};

export default EditarComunidad;