import React, { useState, useEffect, useCallback } from 'react'; // Añadido useCallback
import { useAuth } from '../../context/useAuth';
import { ComunidadService } from '../../services/ComunidadService';
import { MovimientoService } from '../../services/MovimientoService';
import { Container, Row, Col, Form, Table, Spinner, Alert, Button, Tabs, Tab } from 'react-bootstrap';

interface MovimientoIVA {
    _id: string;
    fecha: string;
    descripcion: string;
    baseImponible: number;
    tipoIva: number;
    ivaCuota: number;
    importe: number;
    tipo: 'Ingreso' | 'Gasto' | string; // Añadido string para flexibilidad
}

const LibrosIVA: React.FC = () => {
    const { hasRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [selectedComunidad, setSelectedComunidad] = useState<string>('admin_oficina'); // Iniciamos en administración
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [movimientos, setMovimientos] = useState<MovimientoIVA[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEmployee = hasRole(['admin', 'empleado']);

    // Cargar comunidades iniciales
    useEffect(() => {
        const fetchComunidades = async () => {
            try {
                if (isEmployee) {
                    const data = await ComunidadService.getAll();
                    setComunidades(data);
                }
            } catch (err) {
                setError("Error al cargar el listado de comunidades.");
            } finally {
                setLoading(false);
            }
        };
        fetchComunidades();
    }, [isEmployee]);

    // Función de carga de datos envuelta en useCallback para evitar renders infinitos
    const fetchData = useCallback(async () => {
        if (!selectedComunidad || !year) return;

        setLoadingData(true);
        setError(null);
        try {
            const data = await MovimientoService.getByComunidadAndYear(selectedComunidad, year);
            // Aseguramos que data sea un array antes de setearlo
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Error cargando IVA:", err);
            setError("No se pudieron obtener los datos fiscales para el periodo seleccionado.");
            setMovimientos([]);
        } finally {
            setLoadingData(false);
        }
    }, [selectedComunidad, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderTable = (tipoFiltro: string) => {
        // Normalizamos el tipo para la comparación (Backend suele usar 'Gasto'/'Ingreso')
        const filtrados = movimientos.filter(m =>
            m.tipo?.toLowerCase() === tipoFiltro.toLowerCase()
        );

        const totalBase = filtrados.reduce((acc, m) => acc + (Number(m.baseImponible) || 0), 0);
        const totalIVA = filtrados.reduce((acc, m) => acc + (Number(m.ivaCuota) || 0), 0);
        const totalFactura = filtrados.reduce((acc, m) => acc + (Number(m.importe) || 0), 0);

        if (filtrados.length === 0 && !loadingData) {
            return <div className="text-center my-4 text-muted">No hay registros de {tipoFiltro.toLowerCase()} para este periodo.</div>;
        }

        return (
            <div className="mt-3 table-responsive">
                <Table striped bordered hover size="sm" className="align-middle">
                    <thead className="table-dark text-center">
                    <tr>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Base Imponible</th>
                        <th>% IVA</th>
                        <th>Cuota IVA</th>
                        <th>Total Factura</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtrados.map(m => (
                        <tr key={m._id}>
                            <td className="text-center">{new Date(m.fecha).toLocaleDateString('es-ES')}</td>
                            <td>{m.descripcion}</td>
                            <td className="text-end">{m.baseImponible?.toFixed(2)} €</td>
                            <td className="text-center">{m.tipoIva}%</td>
                            <td className="text-end">{m.ivaCuota?.toFixed(2)} €</td>
                            <td className="text-end fw-bold">{m.importe?.toFixed(2)} €</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot className="table-secondary fw-bold text-end">
                    <tr>
                        <td colSpan={2}>TOTALES</td>
                        <td>{totalBase.toFixed(2)} €</td>
                        <td>-</td>
                        <td>{totalIVA.toFixed(2)} €</td>
                        <td>{totalFactura.toFixed(2)} €</td>
                    </tr>
                    </tfoot>
                </Table>
            </div>
        );
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando configuración...</p>
        </Container>
    );

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-book"></i> Libros de Registro de IVA</h2>
                <Button variant="outline-primary" onClick={() => window.print()} className="d-print-none">
                    <i className="bi bi-printer"></i> Imprimir Informe
                </Button>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible className="d-print-none">
                    {error}
                </Alert>
            )}

            <Row className="mb-4 bg-light p-3 rounded shadow-sm d-print-none">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-bold">Entidad / Comunidad</Form.Label>
                        <Form.Select
                            value={selectedComunidad}
                            onChange={(e) => setSelectedComunidad(e.target.value)}
                        >
                            <option value="admin_oficina">🏢 Administración de Fincas (Honorarios/Gastos Propios)</option>
                            <hr />
                            {comunidades.map(c => (
                                <option key={c._id} value={c._id}>{c.nombre}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-bold">Año Fiscal</Form.Label>
                        <Form.Control
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Tabs defaultActiveKey="soportado" className="mb-3 d-print-block">
                <Tab eventKey="soportado" title="IVA Soportado (Gastos/Compras)">
                    {loadingData ? <div className="text-center p-5"><Spinner animation="grow" /></div> : renderTable('Gasto')}
                </Tab>
                <Tab eventKey="repercutido" title="IVA Repercutido (Ingresos/Ventas)">
                    {loadingData ? <div className="text-center p-5"><Spinner animation="grow" /></div> : renderTable('Ingreso')}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default LibrosIVA;