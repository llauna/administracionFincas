import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { PropiedadService } from '../../services/PropiedadService';
import {LinkContainer} from "react-router-bootstrap";

interface Propiedad {
    _id: string;
    referencia: string;
    tipo: string;
    direccion: string;
    // Agregar más campos según sea necesario
}

const Propiedades: React.FC = () => {
    const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPropiedades = async () => {
            try {
                const data = await PropiedadService.getAll();
                setPropiedades(data);
            } catch (err) {
                setError('Error al cargar las propiedades');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPropiedades();
    }, []);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Propiedades</h2>
                <LinkContainer to={`/propiedades/nueva`}>
                    <Button variant="primary">
                        Nueva Propiedad
                    </Button>
                </LinkContainer>
            </div>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Referencia</th>
                    <th>Tipo</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {propiedades.map((propiedad) => (
                    <tr key={propiedad._id}>
                        <td>{propiedad.referencia}</td>
                        <td>{propiedad.tipo}</td>
                        <td>{propiedad.direccion}</td>
                        <td>
                            <LinkContainer to={`/propiedades/editar/${propiedad._id}`}>
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

export default Propiedades;