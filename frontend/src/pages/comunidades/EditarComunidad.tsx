import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Button, Spinner, Alert,
    Tabs, Tab, Table, Badge,
    InputGroup, Form, Row, Col, Pagination
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
    const [loadingProperties, setLoadingProperties] = useState(false);

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 10;

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
                // Cargamos comunidad y propiedades en paralelo para mayor velocidad
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
                // Guardamos todas las propiedades (pisos, locales y parkings)
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
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) :
                type === 'checkbox' ? checked :
                    value
        }));
    };

    const fetchProperties = async () => {
        if (!id) return;
        setLoadingProperties(true);
        try {
            // Asegúrate de que tu backend tenga definida la ruta GET /api/propiedades/comunidad/:id
            const propiedades = await PropiedadService.getByComunidad(id);
            setProperties(propiedades);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setError('No se pudieron cargar las propiedades. Verifique la ruta del servidor.');
        } finally {
            setLoadingProperties(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [id]);

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

    // Renderizado condicional de carga
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Cargando comunidad...</p>
                </div>
            </div>
        );
    }

    if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="mt-4">
            <h2>Editar Comunidad: {formData.nombre}</h2>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'detalles')} className="mb-3">
                <Tab eventKey="detalles" title="Detalles">
                    <div className="mt-3">
                        <Form onSubmit={handleSubmit} key={formData.nombre}>
                            <Row>
                                <Col md={6}>
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
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Código Postal</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="codigoPostal"
                                            value={formData.codigoPostal}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ciudad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ciudad"
                                            value={formData.ciudad}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>País</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="pais"
                                            value={formData.pais}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-between mt-4">
                                <Button variant="primary" type="submit">
                                    Guardar Cambios
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/comunidades')}>
                                    Volver
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Tab>

                <Tab eventKey="propiedades" title="Propiedades">
                    <div className="mt-3">
                        <div className="d-flex justify-content-between mb-3">
                            <h4>Propiedades de la Comunidad</h4>
                            <div style={{ width: '300px' }}>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Buscar propiedades..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button variant="outline-secondary">
                                        <i className="bi bi-search"></i>
                                    </Button>
                                </InputGroup>
                            </div>
                        </div>

                        {loadingProperties ? (
                            <div className="text-center my-4">
                                <Spinner animation="border" />
                                <p>Cargando propiedades...</p>
                            </div>
                        ) : (
                            <>
                                <Table striped bordered hover>
                                    <thead>
                                    <tr>
                                        <th>Referencia</th>
                                        <th>Tipo</th>
                                        <th>Piso</th>
                                        <th>Puerta</th>
                                        <th>Estado</th>
                                        <th>Propietario</th>
                                        <th>Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentProperties.length > 0 ? (
                                        currentProperties.map((propiedad) => (
                                            <tr key={propiedad.id}>
                                                <td>{propiedad.referencia}</td>
                                                <td>
                                                    {propiedad.tipo === 'piso' && 'Piso'}
                                                    {propiedad.tipo === 'local' && 'Local Comercial'}
                                                    {propiedad.tipo === 'garaje' && 'Plaza Parking'}
                                                </td>
                                                <td>{propiedad.piso || '-'}</td>
                                                <td>{propiedad.puerta || '-'}</td>
                                                <td>
                                                    <Badge bg={propiedad.estado === 'disponible' ? 'success' : 'primary'}>
                                                        {propiedad.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {propiedad.propietario && typeof propiedad.propietario === 'object'
                                                        ? (propiedad.propietario as any).nombre || (propiedad.propietario as any).name
                                                        : 'Sin propietario'}
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/propiedades/editar/${propiedad.id}`)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center">
                                                No se encontraron propiedades
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
                            </>
                        )}
                    </div>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default EditarComunidad;