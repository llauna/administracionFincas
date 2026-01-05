import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Table, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { PropiedadService } from '../../services/PropiedadService';
import { LinkContainer } from "react-router-bootstrap";

const Propiedades: React.FC = () => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const [propiedades, setPropiedades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPropiedades = async () => {
        try {
            setLoading(true);
            const data = await PropiedadService.getAll();
            if (hasRole(['cliente', 'viewer', 'propietario'])) {
                // Filtramos las propiedades que pertenecen al usuario logueado
                // Asumo que el campo en tu base de datos es 'propietarioEmail' o similar
                const filtradas = data.filter((p: any) =>
                    p.propietarioEmail === user?.email || p.propietario === user?._id
                );
                setPropiedades(filtradas);
            } else {
                // Admin y empleados ven todo
                setPropiedades(data);
            }
        } catch (err) {
            setError('Error al cargar las propiedades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropiedades();
    }, [user]);

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

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" />
        </Container>
    );

    const isPrivileged = !hasRole(['cliente', 'viewer', 'propietario']);


    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{isPrivileged ? "Gestión de Propiedades" : "Mis Propiedades"}</h2>
                <div>
                    {/* Solo el Admin/Empleado puede crear propiedades */}
                    {isPrivileged && (
                        <LinkContainer to="/propiedades/nueva">
                            <Button variant="primary" className="me-2">Nueva Propiedad</Button>
                        </LinkContainer>
                    )}
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>Volver</Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                <tr>
                    <th>Dirección</th>
                    <th>Tipo</th>
                    {isPrivileged && <th>Acciones</th>}
                </tr>
                </thead>
                <tbody>
                {propiedades.length > 0 ? (
                    propiedades.map((p) => (
                        <tr key={p._id}>
                            <td>{p.direccion}</td>
                            <td>{p.tipo}</td>
                            {isPrivileged && (
                                <td>
                                    <LinkContainer to={`/propiedades/editar/${p._id}`}>
                                        <Button variant="info" size="sm" className="me-2">Editar</Button>
                                    </LinkContainer>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(p._id)}
                                    >
                                        Eliminar
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={isPrivileged ? 3 : 2} className="text-center">
                            No se encontraron propiedades asociadas.
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </Container>
    );
};

export default Propiedades;