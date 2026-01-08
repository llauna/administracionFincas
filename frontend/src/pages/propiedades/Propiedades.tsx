import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Table, Button, Container, Spinner, Alert, Pagination } from 'react-bootstrap';
import { PropiedadService } from '../../services/PropiedadService';
import { LinkContainer } from "react-router-bootstrap";

const Propiedades: React.FC = () => {
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();
    const [propiedades, setPropiedades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 10;

    const fetchPropiedades = async () => {
        try {
            setLoading(true);
            const data = await PropiedadService.getAll();

            if (hasRole(['cliente', 'viewer', 'propietario'])) {
                // Filtramos las propiedades que pertenecen al usuario logueado
                const filtradas = data.filter((p: any) =>
                    p.propietarioEmail === user?.email || p.propietario === user?._id
                );
                setPropiedades(filtradas);
            } else {
                // Admin y empleados: Filtramos para ver solo las propiedades que ya tienen un propietario vinculado
                const vinculadas = data.filter((p: any) =>
                    p.propietario && p.propietario !== '000000000000000000000000'
                );
                setPropiedades(vinculadas);
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
                await fetchPropiedades();
            } catch (err) {
                setError('Error al eliminar la propiedad');
            }
        }
    };

    // --- LÓGICA DE PAGINACIÓN ---
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = propiedades.slice(indexOfFirstProperty, indexOfLastProperty);
    const totalPages = Math.ceil(propiedades.length / propertiesPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                {currentProperties.length > 0 ? (
                    currentProperties.map((p) => (
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

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => paginate(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}
        </Container>
    );
};

export default Propiedades;