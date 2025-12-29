import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ComunidadService } from '../../services/ComunidadService';

interface NuevaComunidadProps {
    onSuccess?: () => void;
    isModal?: boolean;
}
const NuevaComunidad: React.FC<NuevaComunidadProps> = ({ onSuccess, isModal = false }) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ComunidadService.create(formData);
            if (isModal && onSuccess) {
                onSuccess(); // Si es modal, ejecutamos la recarga en lugar de navegar
            } else {
                navigate('/comunidades');
            }
        } catch (err) {
            setError('Error al crear la comunidad');
            console.error(err);
        }
    };

    return (
        <Container className={isModal ? "" : "mt-4"}>
            {!isModal && <h2>Nueva Comunidad</h2>}
            <h2>Nueva Comunidad</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type="text" name="nombre"
                        placeholder="Nombre de la comunidad"
                        value={formData.nombre} onChange={handleChange} required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="direccion"
                        placeholder="Dirección completa"
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" className="me-2">
                        Guardar
                    </Button>
                    {!isModal ? (
                        <Button variant="secondary" onClick={() => navigate('/comunidades')}>
                            Volver
                        </Button>
                    ) : (
                        <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={() => {
                                if (onSuccess) onSuccess();
                                navigate('/propietarios/nuevo');
                            }}
                        >
                            Ir Alta de Propietario
                        </Button>
                    )}
                </div>
            </Form>
        </Container>
    );
};

export default NuevaComunidad;