import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { ComunidadService } from '../../services/ComunidadService';
import { MovimientoService } from '../../services/MovimientoService';
import { Container, Row, Col, Form, Table, Spinner, Alert, Button, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFileExcel, FaFileCsv, FaPrint, FaTrashAlt, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

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

interface Filtros {
    searchText: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
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
    const [filtros, setFiltros] = useState<Filtros>({
        searchText: '',
        fechaInicio: new Date(new Date().getFullYear(), 0, 1), // 1 de enero del año actual
        fechaFin: new Date(new Date().getFullYear(), 11, 31)   // 31 de diciembre del año actual
    });
    const navigate = useNavigate();

    const isEmployee = hasRole(['admin', 'empleado']);

    // Obtener facturas únicas agrupadas
    const obtenerFacturasUnicas = useCallback((listaMovimientos: MovimientoIVA[]) => {
        const facturasAgrupadas: { [key: string]: MovimientoIVA } = {};

        listaMovimientos.forEach(mov => {
            const fechaMov = new Date(mov.fecha);
            if (filtros.fechaInicio && fechaMov < filtros.fechaInicio) return;
            if (filtros.fechaFin) {
                const fin = new Date(filtros.fechaFin);
                fin.setHours(23, 59, 59, 999);
                if (fechaMov > fin) return;
            }

            const titular = mov.proveedor?.nombre || "";
            const descripcionBase = mov.descripcion.split('(')[0].trim();
            const claveFactura = `${mov.fecha.split('T')[0]}-${descripcionBase}`;

            if (!facturasAgrupadas[claveFactura]) {
                facturasAgrupadas[claveFactura] = {
                    ...mov,
                    descripcion: titular ? `${titular}: ${descripcionBase}` : descripcionBase,
                    baseImponible: Number(mov.baseImponible) || 0,
                    ivaCuota: Number(mov.ivaCuota) || 0,
                    importe: Number(mov.importe) || 0
                };
            } else {
                facturasAgrupadas[claveFactura].baseImponible = Number((facturasAgrupadas[claveFactura].baseImponible + (Number(mov.baseImponible) || 0)).toFixed(2));
                facturasAgrupadas[claveFactura].ivaCuota = Number((facturasAgrupadas[claveFactura].ivaCuota + (Number(mov.ivaCuota) || 0)).toFixed(2));
                facturasAgrupadas[claveFactura].importe = Number((facturasAgrupadas[claveFactura].importe + (Number(mov.importe) || 0)).toFixed(2));
            }
        });

        return Object.values(facturasAgrupadas)
            .filter(factura =>
                factura.descripcion.toLowerCase().includes(filtros.searchText.toLowerCase())
            )
            .map(f => {
                const porcentajeIVA = Number(f.tipoIva) || 21;
                if ((f.baseImponible === f.importe || f.baseImponible === 0) && f.importe > 0) {
                    f.baseImponible = Number((f.importe / (1 + (porcentajeIVA / 100))).toFixed(2));
                    f.ivaCuota = Number((f.importe - f.baseImponible).toFixed(2));
                }
                return f;
            });
    }, [filtros.searchText, filtros.fechaInicio, filtros.fechaFin]);

    // Cargar comunidades
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

    // Cargar movimientos
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

    const movimientosFiltrados = useMemo(() => {
        const facturasUnicas = obtenerFacturasUnicas(movimientos);
        return facturasUnicas;
    }, [movimientos, obtenerFacturasUnicas]);

    // Exportar a Excel
    const exportToExcel = (tipo: 'Gasto' | 'Ingreso') => {
        const movimientosPorTipo = movimientos.filter(m =>
            m.tipo?.toLowerCase() === tipo.toLowerCase()
        );
        const data = obtenerFacturasUnicas(movimientosPorTipo).map(mov => ({
            Fecha: new Date(mov.fecha).toLocaleDateString('es-ES'),
            Concepto: mov.descripcion,
            'Base Imponible': mov.baseImponible,
            '% IVA': mov.tipoIva,
            'Cuota IVA': mov.ivaCuota,
            'Total Factura': mov.importe
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tipo === 'Gasto' ? 'IVA Soportado' : 'IVA Repercutido');
        XLSX.writeFile(wb, `Libro_IVA_${tipo}_${year}.xlsx`);
    };

    // Exportar a CSV
    const exportToCSV = (tipo: 'Gasto' | 'Ingreso') => {
        const movimientosPorTipo = movimientos.filter(m =>
            m.tipo?.toLowerCase() === tipo.toLowerCase()
        );
        const data = obtenerFacturasUnicas(movimientosPorTipo);
        let csvContent = "data:text/csv;charset=utf-8,";

        // Headers
        csvContent += "Fecha;Concepto;Base Imponible;% IVA;Cuota IVA;Total Factura\n";

        // Data
        data.forEach(item => {
            const row = [
                new Date(item.fecha).toLocaleDateString('es-ES'),
                `"${item.descripcion}"`,
                item.baseImponible.toFixed(2).replace('.', ','),
                item.tipoIva,
                item.ivaCuota.toFixed(2).replace('.', ','),
                item.importe.toFixed(2).replace('.', ',')
            ].join(';');
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Libro_IVA_${tipo}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Renderizar tabla
    const renderTable = (tipoFiltro: 'Gasto' | 'Ingreso') => {
        const movimientosPorTipo = movimientosFiltrados.filter(m =>
            m.tipo?.toLowerCase() === tipoFiltro.toLowerCase() && (m.baseImponible > 0 || m.ivaCuota > 0)
        );

        const filtrados = obtenerFacturasUnicas(movimientosPorTipo);
        const totalBase = filtrados.reduce((acc, m) => acc + (Number(m.baseImponible) || 0), 0);
        const totalIVA = filtrados.reduce((acc, m) => acc + (Number(m.ivaCuota) || 0), 0);
        const totalFactura = filtrados.reduce((acc, m) => acc + (Number(m.importe) || 0), 0);

        if (filtrados.length === 0 && !loadingData) {
            return (
                <div className="text-center my-5 py-5 bg-light rounded">
                    <h4 className="text-muted">No hay registros de {tipoFiltro === 'Gasto' ? 'IVA Soportado' : 'IVA Repercutido'}</h4>
                    <p className="text-muted">No se encontraron facturas para el periodo seleccionado.</p>
                </div>
            );
        }

        return (
            <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3 d-print-none">
                    <div className="d-flex gap-2">
                        <Button variant="outline-success" size="sm" onClick={() => exportToExcel(tipoFiltro)}>
                            <FaFileExcel className="me-1" /> Excel
                        </Button>
                        <Button variant="outline-primary" size="sm" onClick={() => exportToCSV(tipoFiltro)}>
                            <FaFileCsv className="me-1" /> CSV
                        </Button>
                    </div>
                    <div className="text-muted small">
                        Mostrando {filtrados.length} registros
                    </div>
                </div>

                <div className="table-responsive printable-area">
                    <Table striped bordered hover size="sm" className="align-middle">
                        <thead className="table-dark text-center">
                        <tr>
                            <th style={{ width: '10%' }}>Fecha</th>
                            <th>Titular / Concepto</th>
                            <th style={{ width: '15%' }}>Base Imponible</th>
                            <th style={{ width: '8%' }}>% IVA</th>
                            <th style={{ width: '12%' }}>Cuota IVA</th>
                            <th style={{ width: '15%' }}>Total Factura</th>
                            <th className="d-print-none" style={{ width: '10%' }}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtrados.map(m => (
                            <tr key={m._id}>
                                <td className="text-center">{new Date(m.fecha).toLocaleDateString('es-ES')}</td>
                                <td className="text-wrap">
                                    {/* Si el backend trae el proveedor, lo mostramos aquí */}
                                    {m.proveedor?.nombre ? <strong>{m.proveedor.nombre}: </strong> : null}
                                    {m.descripcion}
                                </td>
                                <td className="text-end">{m.baseImponible?.toFixed(2).replace('.', ',')} €</td>
                                <td className="text-center">{m.tipoIva}%</td>
                                <td className="text-end">{m.ivaCuota?.toFixed(2).replace('.', ',')} €</td>
                                <td className="text-end fw-bold">{m.importe?.toFixed(2).replace('.', ',')} €</td>
                                <td className="text-center d-print-none">
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleBorrarFactura(m.descripcion)}
                                        title="Eliminar factura"
                                    >
                                        <FaTrashAlt />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot className="table-secondary fw-bold text-end">
                        <tr>
                            <td className="text-start">TOTALES</td>
                            <td></td> {/* Espacio bajo Concepto */}
                            <td>{totalBase.toFixed(2).replace('.', ',')} €</td>
                            <td>-</td>
                            <td>{totalIVA.toFixed(2).replace('.', ',')} €</td>
                            <td className={hasRole(['admin', 'empleado']) ? "" : "text-end"}>
                                {totalFactura.toFixed(2).replace('.', ',')} €
                            </td>
                            <td className="d-print-none"></td> {/* Espacio bajo Acciones */}
                        </tr>
                        </tfoot>
                    </Table>
                </div>
            </div>
        );
    };

    const handleBorrarFactura = async (descripcion: string) => {
        if (!window.confirm(`¿Estás seguro de borrar la factura "${descripcion}"?`)) return;

        setLoadingData(true); // Bloqueamos UI mientras borra
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/movimientos/factura-servicio-empresa', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Aseguramos el token
                },
                body: JSON.stringify({ descripcion: descripcion.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.mensaje || 'Factura eliminada correctamente');
                await fetchData(); // Forzamos recarga de datos
            } else {
                throw new Error(data.mensaje || 'Error al eliminar la factura');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error al borrar:', err);
        } finally {
            setLoadingData(false);
        }
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando configuración...</p>
        </Container>
    );

    return (
        <Container className="mt-4 mb-5" id="libro-iva-container">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                <div>
                    <h1 className="h3 mb-1">Libros de Registro de IVA</h1>
                    <p className="text-muted mb-0">Gestión de facturas de gastos e ingresos</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                        Volver
                    </Button>
                    <Button variant="primary" onClick={() => window.print()}>
                        <FaPrint className="me-1" /> Imprimir
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="d-none d-print-block mb-4 border-bottom pb-3">
                <div className="d-flex justify-content-between align-items-end">
                    <div>
                        <h2 className="mb-1">Libro de Registro de IVA</h2>
                        <h4 className="text-muted mb-0">
                            Ejercicio {year} - {comunidades.find(c => c._id === selectedComunidad)?.nombre || 'Administración de Fincas'}
                        </h4>
                    </div>
                    <div className="text-end">
                        <div className="small">Fecha de generación: {new Date().toLocaleDateString('es-ES')}</div>
                        <div className="small">Hora: {new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="d-print-none">
                    {error}
                </Alert>
            )}

            {/* Filtros */}
            <div className="card mb-4 d-print-none">
                <div className="card-body">
                    <h5 className="card-title mb-3">Filtros</h5>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Entidad / Comunidad</Form.Label>
                                <Form.Select
                                    value={selectedComunidad}
                                    onChange={(e) => setSelectedComunidad(e.target.value)}
                                >
                                    <option value="admin_oficina">🏢 Administración de Fincas</option>
                                    <option disabled>──────────────────</option>
                                    {comunidades.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>Año Fiscal</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={year}
                                    onChange={(e) => {
                                        const newYear = Number(e.target.value);
                                        setYear(newYear);
                                        setFiltros(prev => ({
                                            ...prev,
                                            fechaInicio: new Date(newYear, 0, 1),
                                            fechaFin: new Date(newYear, 11, 31)
                                        }));
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha desde</Form.Label>
                                <DatePicker
                                    selected={filtros.fechaInicio}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            setFiltros(prev => ({...prev, fechaInicio: date}));
                                        }
                                    }}
                                    selectsStart
                                    startDate={filtros.fechaInicio}
                                    endDate={filtros.fechaFin}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control"
                                    locale="es" showMonthDropdown showYearDropdown dropdownMode="select"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha hasta</Form.Label>
                                <DatePicker
                                    selected={filtros.fechaFin}
                                    onChange={(date: Date | null) => {
                                        if (date) {
                                            setFiltros(prev => ({...prev, fechaFin: date}));
                                        }
                                    }}
                                    selectsEnd
                                    startDate={filtros.fechaInicio}
                                    endDate={filtros.fechaFin}
                                    // 3. CORRECCIÓN minDate: Aseguramos que siempre reciba un Date o undefined
                                    minDate={filtros.fechaInicio || undefined}
                                    dateFormat="dd/MM/yyyy"
                                    className="form-control"
                                    locale="es"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>Buscar concepto</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar por concepto o descripción..."
                                        value={filtros.searchText}
                                        onChange={(e) =>
                                            setFiltros(prev => ({...prev, searchText: e.target.value}))
                                        }
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Pestañas de IVA Soportado/Repercutido */}
            <Tabs defaultActiveKey="soportado" id="iva-tabs" className="mb-3 d-print-none">
                <Tab
                    eventKey="soportado"
                    title={
                        <span>
                            <FaCalendarAlt className="me-1" /> IVA Soportado
                        </span>
                    }
                >
                    {loadingData ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Cargando IVA Soportado...</p>
                        </div>
                    ) : (
                        renderTable('Gasto')
                    )}
                </Tab>
                <Tab
                    eventKey="repercutido"
                    title={
                        <span>
                            <FaCalendarAlt className="me-1" /> IVA Repercutido
                        </span>
                    }
                >
                    {loadingData ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Cargando IVA Repercutido...</p>
                        </div>
                    ) : (
                        renderTable('Ingreso')
                    )}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default LibrosIVA;