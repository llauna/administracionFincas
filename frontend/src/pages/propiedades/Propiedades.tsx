import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { PropiedadService } from '../../services/PropiedadService';
import {LinkContainer} from "react-router-bootstrap";

const Propiedades: React.FC = () => {
    const navigate = useNavigate();
    const [propiedades, setPropiedades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPropiedades = async () => {
        try {
            setLoading(true);
            const data = await PropiedadService.getAll();
            setPropiedades(data);
        } catch (err) {
            setError('Error al cargar las propiedades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropiedades();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
            try {
                await PropiedadService.delete(id);
                await fetchPropiedades(); // Ahora sí existe
            } catch (err) {
                setError('Error al eliminar la propiedad');
            }
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Propiedades</h2>
                <div>
                    <LinkContainer to="/propiedades/nueva">
                        <Button variant="primary" className="me-2">Nueva Propiedad</Button>
                    </LinkContainer>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>Volver</Button>
                </div>
            </div>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Dirección</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {propiedades.map((p) => (
                    <tr key={p._id}>
                        <td>{p.direccion}</td>
                        <td>{p.tipo}</td>
                        <td>
                            <LinkContainer to={`/propiedades/editar/${p._id}`}>
                                <Button variant="info" size="sm" className="me-2">Editar</Button>
                            </LinkContainer>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(p._id)} // <-- AQUÍ ES DONDE SE USA
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

export default Propiedades;