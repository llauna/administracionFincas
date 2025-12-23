import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { ComunidadService } from '../../services/ComunidadService';
import { LinkContainer } from 'react-router-bootstrap';

interface Comunidad {
    _id: string;
    nombre: string;
    direccion: string;
    // Agregar más campos según sea necesario
}

const Comunidades: React.FC = () => {
    const [comunidades, setComunidades] = useState<Comunidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComunidades = async () => {
            try {
                const data = await ComunidadService.getAll();
                setComunidades(data);
            } catch (err) {
                setError('Error al cargar las comunidades');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComunidades();
    }, []);

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

                            <Button variant="danger" size="sm">
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