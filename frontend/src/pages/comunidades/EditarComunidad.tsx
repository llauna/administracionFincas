import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Tabs, Tab, Table, Badge, Form, Row, Col, Pagination
} from 'react-bootstrap';
import { ComunidadService } from '../../services/ComunidadService';
import { PropiedadService } from '../../services/PropiedadService';
import { PropiedadGenerator } from '../../services/PropiedadGenerator';
import { PropietarioService } from '../../services/PropietarioService';
import type { Propiedad } from '../../models/Propiedad';

const EditarComunidad: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('detalles');

    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState<Propiedad[]>([]);
    const [movimientos, setMovimientos] = useState<any[]>([]);
    const [propietarios, setPropietarios] = useState<any[]>([]);

    // Estados para paginación de Propiedades
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 8;

    // Estados para paginación de Movimientos (AQUÍ ESTABA EL ERROR, FALTABAN ESTOS ESTADOS)
    const [currentMovPage, setCurrentMovPage] = useState(1);
    const [movsPerPage, setMovsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        coeficiente: 0,
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
                const [comunidadData, propiedades, dataMovs, listaPropietarios] = await Promise.all([
                    ComunidadService.getById(id),
                    PropiedadService.getByComunidad(id),
                    fetch(`http://localhost:5000/api/movimientos/comunidad/${id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }).then(res => res.json()),
                    PropietarioService.getAll()
                ]);

                if (comunidadData) {
                    setFormData({
                        nombre: comunidadData.nombre || '',
                        direccion: comunidadData.direccion || '',
                        coeficiente: comunidadData.coeficiente || '',
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
                setMovimientos(Array.isArray(dataMovs) ? dataMovs : []);
                setPropietarios(listaPropietarios || []);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los datos de la comunidad');
                // Aseguramos que el estado de carga termine aunque haya error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Función para asignar un propietario directamente desde la tabla
    const handleAsignarPropietario = async (propiedadId: string, propietarioId: string) => {
        if (!propietarioId) return;
        try {
            await PropiedadService.update(propiedadId, {
                propietario: propietarioId,
                estado: 'ocupado'
            } as any);

            // Recargamos la lista local para ver el cambio
            const actualizado = await PropiedadService.getByComunidad(id!);
            setProperties(actualizado);
        } catch (err) {
            alert("Error al asignar el propietario");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ComunidadService.update(id!, formData);
            alert('Datos de la comunidad actualizados');
            // No navegamos fuera para poder seguir editando o generar propiedades
        } catch (err) {
            setError('Error al actualizar la comunidad');
        }
    };

    const handleGenerate = async () => {
        if (!id) return;
        if (properties.length > 0) {
            if (!window.confirm("Esta comunidad ya tiene propiedades. Si generas nuevas, se añadirán a las existentes. ¿Deseas continuar?")) return;
        }

        try {
            setLoading(true);
            await PropiedadGenerator.generateForCommunity({
                direccion: formData.direccion,
                numPisos: formData.numPisos,
                pisosPorBloque: formData.pisosPorBloque,
                tieneLocales: formData.tieneLocales,
                localesPorPlanta: formData.localesPorPlanta,
                tieneParking: formData.tieneParking,
                plazasParking: formData.plazasParking,
                comunidadId: id
            });

            // Recargamos las propiedades para que aparezcan en la lista
            const nuevasPropiedades = await PropiedadService.getByComunidad(id);
            setProperties(nuevasPropiedades || []);
            setActiveTab('propiedades'); // Saltamos a la pestaña de lista
            alert('Propiedades generadas con éxito');
        } catch (err) {
            setError('Error al generar las propiedades');
        } finally {
            setLoading(false);
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

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Lógica para paginación de PROPIEDADES
    const totalPages = Math.max(1, Math.ceil(filteredProperties.length / propertiesPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const indexOfLastProperty = safePage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

    // Lógica para paginación de MOVIMIENTOS (Añadimos esto aquí para que las variables existan)
    const totalMovPages = Math.max(1, Math.ceil(movimientos.length / movsPerPage));
    const indexOfLastMov = currentMovPage * movsPerPage;
    const indexOfFirstMov = indexOfLastMov - movsPerPage;
    const currentMovimientos = movimientos.slice(indexOfFirstMov, indexOfLastMov);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container fluid className="px-4 mt-1">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0 text-primary small font-weight-bold">Editar Comunidad: {formData.nombre}</h4>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/comunidades')} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                    <i className="bi bi-arrow-left"></i> Volver
                </Button>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'detalles')} className="mb-1 small">
                <Tab eventKey="detalles" title="Detalles">
                    <div className="mt-4 px-3 border rounded p-4 bg-white shadow-sm mx-auto" style={{ maxWidth: '700px' }}>
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="small mb-1 fw-bold">Nombre de la Comunidad</Form.Label>
                                        <Form.Control size="sm" type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small mb-1 fw-bold">País</Form.Label>
                                        <Form.Control size="sm" type="text" name="pais" value={formData.pais} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="g-3 mt-1">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small mb-1 fw-bold">Dirección Completa</Form.Label>
                                        <Form.Control size="sm" type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="g-3 mt-1">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small mb-1 fw-bold">Código Postal</Form.Label>
                                        <Form.Control size="sm" type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="small mb-1 fw-bold">Ciudad</Form.Label>
                                        <Form.Control size="sm" type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-grid gap-2 mt-4">
                                <Button variant="primary" type="submit" size="sm" className="py-2">
                                    <i className="bi bi-save me-2"></i> Guardar Cambios
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Tab>

                <Tab eventKey="configuracion" title="Generador de Propiedades">
                    <div className="mt-4 px-3 border rounded p-4 bg-white shadow-sm mx-auto" style={{ maxWidth: '700px' }}>
                        <h6 className="text-primary mb-3">Parámetros de Generación Automática</h6>
                        <Alert variant="info" className="py-2 small">
                            Define la estructura del edificio y pulsa "Generar" para crear todos los pisos, locales y parkings automáticamente.
                        </Alert>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small mb-1 fw-bold">Número de Plantas</Form.Label>
                                    <Form.Control size="sm" type="number" name="numPisos" value={formData.numPisos} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small mb-1 fw-bold">Viviendas por Planta</Form.Label>
                                    <Form.Control size="sm" type="number" name="pisosPorBloque" value={formData.pisosPorBloque} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr />

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Check
                                    type="checkbox" label="Incluir locales comerciales" name="tieneLocales"
                                    checked={formData.tieneLocales} onChange={handleChange} className="small fw-bold"
                                />
                                {formData.tieneLocales && (
                                    <Form.Control size="sm" type="number" className="mt-2" placeholder="Cant. locales"
                                                  name="localesPorPlanta" value={formData.localesPorPlanta} onChange={handleChange} />
                                )}
                            </Col>
                            <Col md={6}>
                                <Form.Check
                                    type="checkbox" label="Incluir plazas de parking" name="tieneParking"
                                    checked={formData.tieneParking} onChange={handleChange} className="small fw-bold"
                                />
                                {formData.tieneParking && (
                                    <Form.Control size="sm" type="number" className="mt-2" placeholder="Cant. plazas"
                                                  name="plazasParking" value={formData.plazasParking} onChange={handleChange} />
                                )}
                            </Col>
                        </Row>

                        <div className="d-grid gap-2 mt-4">
                            <Button variant="success" size="sm" className="py-2" onClick={handleGenerate}>
                                <i className="bi bi-gear-fill me-2"></i> Generar Propiedades Ahora
                            </Button>
                        </div>
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
                                                <Badge bg={propiedad.estado === 'disponible' ? 'success' : 'primary'} style={{ fontSize: '0.65rem' }}>
                                                    {propiedad.estado}
                                                </Badge>
                                            </td>
                                            <td style={{ minWidth: '150px' }}>
                                                {propiedad.propietario ? (
                                                    <span className="small">
                                                        {typeof propiedad.propietario === 'object' ? (propiedad.propietario as any).nombre : 'Asignado'}
                                                    </span>
                                                ) : (
                                                    <Form.Select
                                                        size="sm"
                                                        style={{ fontSize: '0.7rem', padding: '2px' }}
                                                        onChange={(e) => handleAsignarPropietario(propiedad._id!, e.target.value)}
                                                    >
                                                        <option value="">-- Asignar dueño --</option>
                                                        {propietarios.map(prop => (
                                                            <option key={prop._id} value={prop._id}>{prop.nombre}</option>
                                                        ))}
                                                    </Form.Select>
                                                )}
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

                <Tab eventKey="movimientos" title={`Movimientos (${movimientos.length})`}>
                    <div className="card shadow-sm p-2 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0 text-muted small">Extracto de Gastos y Repartos</h6>
                            <div className="d-flex align-items-center">
                                <Form.Label className="small mb-0 me-2">Ver:</Form.Label>
                                <Form.Select
                                    size="sm"
                                    style={{ width: '80px', fontSize: '0.75rem' }}
                                    value={movsPerPage}
                                    onChange={(e) => {
                                        setMovsPerPage(Number(e.target.value));
                                        setCurrentMovPage(1);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </Form.Select>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <Table striped hover size="sm" style={{ fontSize: '0.75rem' }}>
                                <thead className="table-dark">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Propiedad</th>
                                    <th>Importe</th>
                                    <th>Estado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentMovimientos.length > 0 ? (
                                    currentMovimientos.map((m: any) => (
                                        <tr key={m._id}>
                                            <td>{new Date(m.fecha).toLocaleDateString()}</td>
                                            <td>{m.descripcion}</td>
                                            <td>
                                                {m.propiedad ? `${m.propiedad.piso || ''} ${m.propiedad.puerta || ''}` : 'N/A'}
                                            </td>
                                            <td className="fw-bold text-danger">
                                                {(m.importe || 0).toFixed(2)}€
                                            </td>
                                            <td>
                                                <Badge bg={m.estado === 'pagado' ? 'success' : 'warning'} style={{ fontSize: '0.65rem' }}>
                                                    {m.estado}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="text-center py-3">No hay movimientos registrados</td></tr>
                                )}
                                </tbody>
                            </Table>

                            {totalMovPages > 1 && (
                                <div className="d-flex justify-content-center mt-1">
                                    <Pagination size="sm" className="mb-0">
                                        <Pagination.Prev onClick={() => setCurrentMovPage(prev => Math.max(prev - 1, 1))} disabled={currentMovPage === 1} />
                                        {[...Array(totalMovPages)].map((_, index) => (
                                            <Pagination.Item
                                                key={index + 1}
                                                active={index + 1 === currentMovPage}
                                                onClick={() => setCurrentMovPage(index + 1)}
                                            >
                                                {index + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next onClick={() => setCurrentMovPage(prev => Math.min(prev + 1, totalMovPages))} disabled={currentMovPage === totalMovPages} />
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