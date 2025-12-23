import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { ComunidadService } from '../../services/ComunidadService';
import { LinkContainer } from 'react-router-bootstrap';

interface Comunidad {
    _id: string;
    nombre: string;
    direccion: string;
    codigoPostal?: string;
    ciudad?: string;
    pais?: string;
    createdAt?: string;
    updatedAt?: string;
}

const Comunidades: React.FC = () => {
    const navigate = useNavigate();
    const [comunidades, setComunidades] = useState<Comunidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchComunidades = async () => {
        try {
            setLoading(true);
            const data = await ComunidadService.getAll();
            setComunidades(data);
        } catch (err) {
            setError('Error al cargar las comunidades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComunidades();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta comunidad?')) {
            try {
                await ComunidadService.delete(id);
                await fetchComunidades(); // Ahora sí funcionará porque está fuera del useEffect
            } catch (err) {
                setError('Error al eliminar la comunidad');
                console.error(err);
            }
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;


    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Comunidades</h2>
                <LinkContainer to="/comunidades/nueva">
                    <Button variant="primary">
                        Nueva Comunidad
                    </Button>
                </LinkContainer>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    Volver
                </Button>

            </div>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {comunidades.map((comunidad) => (
                    <tr key={comunidad._id}>
                        <td>{comunidad.nombre}</td>
                        <td>{comunidad.direccion}</td>
                        <td>
                            <LinkContainer to={`/comunidades/editar/${comunidad._id}`}>
                                <Button variant="info" size="sm" className="me-2">
                                    Editar
                                </Button>
                            </LinkContainer>

                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(comunidad._id)}
                            >
                                Eliminar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default Comunidades;