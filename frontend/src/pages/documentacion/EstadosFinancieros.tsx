import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { ComunidadService } from '../../services/ComunidadService';
import { MovimientoService } from '../../services/MovimientoService';
import {Container, Row, Col, Form, Table, Spinner, Alert, Button, Pagination} from 'react-bootstrap';

interface Movimiento {
    _id: string;
    fecha?: string | Date | null;
    descripcion?: string | null; // <--- Añadimos descripcion
    concepto?: string | null;
    importe?: number | string | null;
    tipo?: 'ingreso' | 'gasto' | string | null;
    propiedad?: {
        piso?: string;
        puerta?: string;
        tipo?: string;
    } | null;
    [key: string]: any;
}

interface Comunidad {
    _id: string;
    nombre: string;
    // Otras propiedades de comunidad si las hay
}

interface PerfilUsuario {
    comunidadId?: string;
    // Otras propiedades del perfil si las necesitas
}

const EstadosFinancieros: React.FC = () => {
    const { hasRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [selectedComunidad, setSelectedComunidad] = useState<string>('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loadingMovimientos, setLoadingMovimientos] = useState(false);
    const [error, setError] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const isEmployee = hasRole(['admin', 'empleado']);
    const isClient = hasRole(['cliente', 'propietario']);

    // Función formateadora de fechas
    const formatDate = (dateString: string | Date): string => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const obtenerPerfilUsuario = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/usuarios/perfil', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener el perfil del usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            return null;
        }
    };


    // Cargar comunidades (solo para empleados)
    useEffect(() => {
        const fetchComunidades = async () => {
            try {
                if (isEmployee) {
                    const data = await ComunidadService.getAll();
                    setComunidades(data);
                    if (data.length > 0) {
                        setSelectedComunidad(data[0]._id);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError('Error al cargar las comunidades');
                setLoading(false);
            }
        };

        fetchComunidades();
    }, [isEmployee]);

    // Cargar movimientos cuando cambia la comunidad o el año
    useEffect(() => {
        const fetchMovimientos = async () => {
            if ((isEmployee && !selectedComunidad) || !year) return;

            try {
                setLoadingMovimientos(true);

                let comunidadId = selectedComunidad;

                if (isClient) {
                    const perfilCompleto = await obtenerPerfilUsuario() as PerfilUsuario;
                    if (perfilCompleto?.comunidadId) {
                        comunidadId = perfilCompleto.comunidadId;
                    } else {
                        setError('No se pudo determinar la comunidad del usuario');
                        setLoadingMovimientos(false);
                        return;
                    }
                }

                if (!comunidadId) {
                    setMovimientos([]);
                    return;
                }

                const data = await MovimientoService.getByComunidadAndYear(comunidadId, year);

                // Procesamos los datos para asegurar que tengan el formato correcto
                const movimientosLimpios = Array.isArray(data) ? data.map(mov => ({
                    _id: mov._id || Math.random().toString(),
                    fecha: mov.fecha ? new Date(mov.fecha) : new Date(),
                    // USAR descripcion si concepto viene vacío
                    concepto: mov.descripcion || mov.concepto || 'Sin concepto',
                    importe: typeof mov.importe === 'number' ? mov.importe :
                        (typeof mov.importe === 'string' ? parseFloat(mov.importe) || 0 : 0),
                    // Asegurar que el tipo sea minúscula para CSS
                    tipo: mov.tipo?.toLowerCase() === 'ingreso' ? 'ingreso' : 'gasto',
                    propiedad: mov.propiedad // <--- Guardamos la propiedad
                })) : [];

                setMovimientos(movimientosLimpios);
                setError(''); // Limpiamos errores si la carga fue exitosa
            } catch (err) {
                console.error('Error al cargar movimientos:', err);
                setMovimientos([]); // Limpiamos la tabla en caso de error
                setError('Error al cargar los movimientos. Verifique que la ruta del servidor sea correcta.');
            } finally {
                setLoadingMovimientos(false);
            }
        };

        fetchMovimientos();
        setCurrentPage(1);
    }, [selectedComunidad, year, isClient, isEmployee]);

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMovimientos = movimientos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(movimientos.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Estados Financieros</h2>
                <Button
                    variant="outline-secondary"
                    onClick={() => window.history.back()}
                    className="d-flex align-items-center gap-1"
                >
                    <i className="bi bi-arrow-left"></i> Volver
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Filtros */}
            <Row className="mb-4">
                {isEmployee && (
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Comunidad</Form.Label>
                            <Form.Select
                                value={selectedComunidad}
                                onChange={(e) => setSelectedComunidad(e.target.value)}
                            >
                                {comunidades.map((comunidad: Comunidad) => (
                                    <option key={comunidad._id} value={comunidad._id}>
                                        {comunidad.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                )}

                <Col md={isEmployee ? 6 : 12}>
                    <Form.Group>
                        <Form.Label>Año</Form.Label>
                        <Form.Control
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                            min="2000"
                            max="2100"
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Tabla de movimientos */}
            {loadingMovimientos ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando movimientos...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    <div className="table-responsive shadow-sm rounded">
                        <Table striped bordered hover className="align-middle mb-0">
                            <thead className="table-dark text-center">
                            <tr>
                                <th style={{ width: '120px' }}>Fecha</th>
                                <th style={{ width: '150px' }}>Finca / Piso</th>
                                <th>Concepto</th>
                                <th style={{ width: '120px' }}>Importe</th>
                                <th style={{ width: '100px' }}>Tipo</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentMovimientos.length > 0 ? (
                                currentMovimientos.map((mov) => (
                                    <tr key={mov._id}>
                                        <td className="text-center">{mov.fecha ? formatDate(mov.fecha) : '---'}</td>
                                        <td className="text-center">
                                            {mov.propiedad ? (
                                                <span className="fw-bold text-primary">
                                                    {mov.propiedad.piso} - {mov.propiedad.puerta}
                                                </span>
                                            ) : (
                                                <span className="text-muted small">General</span>
                                            )}
                                        </td>
                                        <td className="text-wrap" style={{ maxWidth: '300px' }}>
                                            {mov.concepto}
                                        </td>
                                        <td className={`text-end fw-bold ${mov.tipo === 'ingreso' ? 'text-success' : 'text-danger'}`}>
                                            {typeof mov.importe === 'number' ? mov.importe.toFixed(2) : '0.00'} €
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge ${mov.tipo === 'ingreso' ? 'bg-success' : 'bg-danger'}`}>
                                                {mov.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">
                                        No hay movimientos para el año seleccionado
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Controles de Paginación */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
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
        </Container>
    );
};

export default EstadosFinancieros;