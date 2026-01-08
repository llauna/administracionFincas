import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Button, Spinner, Alert,
    Tabs, Tab, Table, Badge,
    Form, Row, Col, Pagination
} from 'react-bootstrap';
import { ComunidadService } from '../../services/ComunidadService';
import { PropiedadService } from '../../services/PropiedadService';
import type { Propiedad } from '../../models/Propiedad';

const EditarComunidad: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('detalles');
    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState<Propiedad[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 8;

    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        codigoPostal: '',
        ciudad: '',
        pais: 'España',
        numPisos: 0,
        pisosPorBloque: 0,
        tieneLocales: false,
        localesPorPlanta: 0,
        tieneParking: false,
        plazasParking: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [comunidadData, propiedades] = await Promise.all([
                    ComunidadService.getById(id),
                    PropiedadService.getByComunidad(id)
                ]);

                if (comunidadData) {
                    setFormData({
                        nombre: comunidadData.nombre || '',
                        direccion: comunidadData.direccion || '',
                        codigoPostal: comunidadData.codigoPostal || '',
                        ciudad: comunidadData.ciudad || '',
                        pais: comunidadData.pais || 'España',
                        numPisos: comunidadData.numPisos || 0,
                        pisosPorBloque: comunidadData.pisosPorBloque || 0,
                        tieneLocales: comunidadData.tieneLocales || false,
                        localesPorPlanta: comunidadData.localesPorPlanta || 0,
                        tieneParking: comunidadData.tieneParking || false,
                        plazasParking: comunidadData.plazasParking || 0
                    });
                }
                setProperties(propiedades || []);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los datos de la comunidad');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ComunidadService.update(id!, formData);
            navigate('/comunidades');
        } catch (err) {
            setError('Error al actualizar la comunidad');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : type === 'checkbox' ? checked : value
        }));
    };

    const filteredProperties = (properties || []).filter(propiedad => {
        const search = searchTerm.toLowerCase();
        return (
            (propiedad.referencia?.toLowerCase() || '').includes(search) ||
            (propiedad.piso?.toString() || '').includes(search) ||
            (propiedad.puerta?.toLowerCase() || '').includes(search)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredProperties.length / propertiesPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const indexOfLastProperty = safePage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container fluid className="px-4 mt-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0 text-primary">Editar Comunidad: {formData.nombre}</h4>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/comunidades')} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                    <i className="bi bi-arrow-left"></i> Volver
                </Button>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'detalles')} className="mb-1 small">
                <Tab eventKey="detalles" title="Detalles">
                    <div className="mt-2 px-2 border rounded p-3 bg-white">
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-2">
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small mb-1">Nombre</Form.Label>
                                        <Form.Control size="sm" type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small mb-1">Dirección</Form.Label>
                                        <Form.Control size="sm" type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="g-2">
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small mb-1">C.P.</Form.Label>
                                        <Form.Control size="sm" type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small mb-1">Ciudad</Form.Label>
                                        <Form.Control size="sm" type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small mb-1">País</Form.Label>
                                        <Form.Control size="sm" type="text" name="pais" value={formData.pais} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="primary" type="submit" size="sm" className="mt-2">
                                <i className="bi bi-save me-1"></i> Guardar Cambios
                            </Button>
                        </Form>
                    </div>
                </Tab>

                <Tab eventKey="propiedades" title={`Propiedades (${filteredProperties.length})`}>
                    <div className="card shadow-sm p-2 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0 text-muted small">Listado de Propiedades</h6>
                            <div style={{ width: '180px' }}>
                                <Form.Control
                                    size="sm" placeholder="Buscar..."
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <Table striped hover size="sm" className="mb-1" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>
                                <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '25%' }}>Referencia</th>
                                    <th>Tipo</th>
                                    <th>Piso</th>
                                    <th>Pta</th>
                                    <th>Estado</th>
                                    <th>Propietario</th>
                                    <th className="text-center">Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentProperties.length > 0 ? (
                                    currentProperties.map((propiedad) => (
                                        <tr key={propiedad._id || (propiedad as any).id}>
                                            <td className="text-truncate" style={{ maxWidth: '150px' }}>{propiedad.referencia || 'Sin Ref.'}</td>
                                            <td>{propiedad.tipo}</td>
                                            <td>{propiedad.piso || '-'}</td>
                                            <td>{propiedad.puerta || '-'}</td>
                                            <td>
                                                <Badge bg={propiedad.estado === 'disponible' ? 'success' : propiedad.estado === 'alquilado' ? 'info' : 'primary'} style={{ fontSize: '0.65rem' }}>
                                                    {propiedad.estado}
                                                </Badge>
                                            </td>
                                            <td className="text-truncate" style={{ maxWidth: '120px' }}>
                                                {propiedad.propietario && typeof propiedad.propietario === 'object' ? (propiedad.propietario as any).nombre : 'Sin prop.'}
                                            </td>
                                            <td className="text-center">
                                                <Button variant="primary" size="sm" style={{ padding: '0px 5px', fontSize: '0.7rem' }} onClick={() => navigate(`/propiedades/editar/${propiedad._id}`)}>
                                                    Editar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className="text-center py-3">No se encontraron propiedades</td></tr>
                                )}
                                </tbody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-1">
                                    <Pagination size="sm" className="mb-0">
                                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                                        {[...Array(totalPages)].map((_, index) => (
                                            <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                                                {index + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default EditarComunidad;