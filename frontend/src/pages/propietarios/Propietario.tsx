import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { PropietarioService } from '../../services/PropietarioService';
import { LinkContainer } from "react-router-bootstrap";
import type {IPropietario} from '../../models/Propietario';

const PropietariosPage: React.FC = () => {
    const navigate = useNavigate();
    const [propietarios, setPropietarios] = useState<IPropietario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPropietarios = async () => {
            try {
                const data = await PropietarioService.getAll();
                setPropietarios(data as IPropietario[]);
            } catch (err) {
                setError('Error al cargar los propietarios');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPropietarios();
    }, []);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Propietarios</h2>
                <LinkContainer to={`/propietarios/nuevo`}>
                    <Button variant="primary">
                        Nuevo Propietario
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
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {propietarios.map((propietario) => (
                    <tr key={propietario._id}>
                        <td>{propietario.nombre}</td>
                        <td>{propietario.email}</td>
                        <td>{propietario.telefono}</td>
                        <td>
                            <LinkContainer to={`/propietarios/editar/${propietario._id}`}>
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

export default PropietariosPage;