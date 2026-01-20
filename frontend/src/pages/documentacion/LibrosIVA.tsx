import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { ComunidadService } from '../../services/ComunidadService';
import { MovimientoService } from '../../services/MovimientoService';
import { Container, Row, Col, Form, Table, Spinner, Alert, Button, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

interface MovimientoIVA {
    _id: string;
    fecha: string;
    descripcion: string;
    baseImponible: number;
    tipoIva: number;
    ivaCuota: number;
    importe: number;
    tipo: 'Ingreso' | 'Gasto' | string;
    proveedor?: { nombre: string };
}

const LibrosIVA: React.FC = () => {
    const { hasRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [selectedComunidad, setSelectedComunidad] = useState<string>('admin_oficina');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [movimientos, setMovimientos] = useState<MovimientoIVA[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const isEmployee = hasRole(['admin', 'empleado']);

    // --- LÓGICA PARA EL PUNTO 3: SUMAR TODOS LOS VECINOS PARA EL TOTAL FACTURA ---
    const obtenerFacturasUnicas = (listaMovimientos: MovimientoIVA[]) => {
        const facturasAgrupadas: { [key: string]: MovimientoIVA } = {};

        listaMovimientos.forEach(mov => {
            // Limpiamos la descripción (quitamos lo que hay entre paréntesis como Ref o Factura)
            const descripcionBase = mov.descripcion.split('(')[0].trim();
            const claveFactura = `${mov.fecha.split('T')[0]}-${descripcionBase}`;

            if (!facturasAgrupadas[claveFactura]) {
                facturasAgrupadas[claveFactura] = {
                    ...mov,
                    descripcion: descripcionBase,
                    baseImponible: Number(mov.baseImponible) || 0,
                    ivaCuota: Number(mov.ivaCuota) || 0,
                    importe: Number(mov.importe) || 0
                };
            } else {
                // SUMA DE TODOS LOS REPARTOS PARA LLEGAR AL TOTAL (140€)
                facturasAgrupadas[claveFactura].baseImponible = Number((facturasAgrupadas[claveFactura].baseImponible + (Number(mov.baseImponible) || 0)).toFixed(2));
                facturasAgrupadas[claveFactura].ivaCuota = Number((facturasAgrupadas[claveFactura].ivaCuota + (Number(mov.ivaCuota) || 0)).toFixed(2));
                facturasAgrupadas[claveFactura].importe = Number((facturasAgrupadas[claveFactura].importe + (Number(mov.importe) || 0)).toFixed(2));
            }
        });

        // RECONSTRUCCIÓN LÓGICA (Si la base sigue siendo 0 después de sumar)
        return Object.values(facturasAgrupadas).map(f => {
            const porcentajeIVA = Number(f.tipoIva) || 21;
            // Si la base es igual al importe y hay IVA, o si la base es 0
            if ((f.baseImponible === f.importe || f.baseImponible === 0) && f.importe > 0) {
                f.baseImponible = Number((f.importe / (1 + (porcentajeIVA / 100))).toFixed(2));
                f.ivaCuota = Number((f.importe - f.baseImponible).toFixed(2));
            }
            return f;
        });
    };

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

    const fetchData = useCallback(async () => {
        if (!selectedComunidad || !year) return;
        setLoadingData(true);
        setError(null);
        try {
            const data = await MovimientoService.getByComunidadAndYear(selectedComunidad, year);
            setMovimientos(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError("No se pudieron obtener los datos fiscales.");
            setMovimientos([]);
        } finally {
            setLoadingData(false);
        }
    }, [selectedComunidad, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePrint = () => {
        window.print();
    };

    const handleBorrarFactura = async (descripcion: string) => {
        if (!window.confirm(`¿Estás seguro de borrar la factura "${descripcion}"? Esto eliminará el registro de la empresa y los repartos en la comunidad.`)) return;
        try {
            // Suponemos que MovimientoService tiene un método deleteFacturaServicio o usamos fetch directo
            const response = await fetch('http://localhost:5000/api/movimientos/factura-servicio-empresa', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ descripcion })
            });
            if (response.ok) {
                alert('Factura eliminada');
                fetchData(); // Recargamos los datos
            }
        } catch (err) {
            alert('Error al borrar');
        }
    };



    const renderTable = (tipoFiltro: string) => {
        const movimientosPorTipo = movimientos.filter(m =>
            m.tipo?.toLowerCase() === tipoFiltro.toLowerCase() && (m.baseImponible > 0 || m.ivaCuota > 0)
        );

        const filtrados = obtenerFacturasUnicas(movimientosPorTipo);

        const totalBase = filtrados.reduce((acc, m) => acc + (Number(m.baseImponible) || 0), 0);
        const totalIVA = filtrados.reduce((acc, m) => acc + (Number(m.ivaCuota) || 0), 0);
        const totalFactura = filtrados.reduce((acc, m) => acc + (Number(m.importe) || 0), 0);

        if (filtrados.length === 0 && !loadingData) {
            return <div className="text-center my-4 text-muted">No hay registros de {tipoFiltro.toLowerCase()} para este periodo.</div>;
        }

        return (
            <div className="mt-3 table-responsive printable-area">
                <h5 className="d-none d-print-block mt-4 mb-2 text-uppercase fw-bold border-bottom">
                    {tipoFiltro === 'Gasto' ? 'Libro de IVA Soportado' : 'Libro de IVA Repercutido'}
                </h5>
                <Table striped bordered hover size="sm" className="align-middle">
                    <thead className="table-dark text-center">
                    <tr>
                        <th style={{ width: '10%' }}>Fecha</th>
                        <th>Titular / Concepto</th>
                        <th style={{ width: '15%' }}>Base Imponible</th>
                        <th style={{ width: '8%' }}>% IVA</th>
                        <th style={{ width: '12%' }}>Cuota IVA</th>
                        <th style={{ width: '15%' }}>Total Factura</th>
                        <th className="d-print-none">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtrados.map(m => (
                        <tr key={m._id}>
                            <td className="text-center">{new Date(m.fecha).toLocaleDateString('es-ES')}</td>
                            <td className="text-wrap">
                                {m.descripcion}
                            </td>
                            <td className="text-end">{m.baseImponible?.toFixed(2)} €</td>
                            <td className="text-center">{m.tipoIva}%</td>
                            <td className="text-end">{m.ivaCuota?.toFixed(2)} €</td>
                            <td className="text-end fw-bold">{m.importe?.toFixed(2)} €</td>
                            <td className="text-center d-print-none">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleBorrarFactura(m.descripcion)}
                                >
                                    Borrar
                                </Button>
                            </td>
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
            {/* 1. CABECERA DE PANTALLA (Visible solo en monitor) */}
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                <h1>Libros de Registro de IVA</h1>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                        Volver
                    </Button>
                    {/* ASEGÚRATE DE QUE EL BOTÓN LLAME A handlePrint */}
                    <Button variant="primary" onClick={handlePrint}>
                        Imprimir Informe
                    </Button>
                </div>
            </div>

            {/* 2. ENCABEZADO DE IMPRESIÓN (Visible solo en papel/PDF) */}
            <div className="d-none d-print-block mb-4 border-bottom pb-2">
                <div className="d-flex justify-content-between align-items-end">
                    <div>
                        <h2 className="mb-0">Libro de Registro de IVA - Ejercicio {year}</h2>
                        <h4 className="text-muted">
                            Entidad: {comunidades.find(c => c._id === selectedComunidad)?.nombre || 'Administración de Fincas'}
                        </h4>
                    </div>
                    <div className="text-end">
                        <small>Fecha de generación: {new Date().toLocaleDateString()}</small>
                    </div>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="d-print-none">{error}</Alert>}


            <div className="d-print-none">
                <Row className="mb-4 bg-light p-3 rounded shadow-sm">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">Entidad / Comunidad</Form.Label>
                            <Form.Select value={selectedComunidad} onChange={(e) => setSelectedComunidad(e.target.value)}>
                                <option value="admin_oficina">🏢 Administración de Fincas</option>
                                <hr />
                                {comunidades.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold">Año Fiscal</Form.Label>
                            <Form.Control type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                        </Form.Group>
                    </Col>
                </Row>
            </div>

            <Tabs defaultActiveKey="soportado" className="mb-3 d-print-block">
                <Tab eventKey="soportado" title="IVA Soportado" className="d-print-block">
                    {loadingData ? <div className="text-center p-5"><Spinner animation="grow" /></div> : renderTable('Gasto')}
                </Tab>
                <Tab eventKey="repercutido" title="IVA Repercutido" className="d-print-block">
                    {loadingData ? <div className="text-center p-5"><Spinner animation="grow" /></div> : renderTable('Ingreso')}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default LibrosIVA;