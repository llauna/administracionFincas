import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Form, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { TesoreriaService } from '../../services/TesoreriaService';
import { ComunidadService } from '../../services/ComunidadService';

const Tesoreria: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [selectedComunidad, setSelectedComunidad] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const coms = await ComunidadService.getAll();
                setComunidades(coms);
                await refreshData('');
            } catch (err) {
                setError("Error al cargar datos iniciales");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const refreshData = async (comId: string) => {
        setLoading(true);
        try {
            const res = await TesoreriaService.getResumen(comId);
            setData(res);
        } catch (err) {
            setError("No se pudo obtener el resumen de tesorería");
        } finally {
            setLoading(false);
        }
    };

    const handleComunidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedComunidad(val);
        refreshData(val);
    };

    if (loading && !data) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0"><i className="bi bi-safe2"></i> Gestión de Tesorería</h2>
                    <small className="text-muted">Control de saldos en cajas y bancos</small>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={() => navigate('/dashboard')}>
                        <i className="bi bi-house"></i> Volver al Inicio
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Row className="mb-4 align-items-end">
                <Col md={5}>
                    <Form.Group>
                        <Form.Label className="fw-bold text-primary">Entidad / Comunidad</Form.Label>
                        <Form.Select value={selectedComunidad} onChange={handleComunidadChange} className="border-primary">
                            <option value="">🌍 Ver Todo (Global)</option>
                            <option value="admin_oficina">🏢 Administración de Fincas</option>
                            {comunidades.map(c => (
                                <option key={c._id} value={c._id}>{c.nombre}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={7} className="text-md-end mt-3 mt-md-0">
                    <ButtonGroup>
                        <Button variant="success">
                            <i className="bi bi-plus-circle"></i> Ajuste de Saldo
                        </Button>
                        <Button variant="warning" className="text-white">
                            <i className="bi bi-arrow-left-right"></i> Transferencia
                        </Button>
                        <Button variant="outline-secondary" onClick={() => refreshData(selectedComunidad)}>
                            <i className="bi bi-arrow-clockwise"></i> Actualizar
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {data && (
                <>
                    {/* Tarjetas de Resumen */}
                    <Row className="mb-4">
                        <Col md={4}>
                            <Card className="text-white bg-primary shadow-sm">
                                <Card.Body className="text-center">
                                    <Card.Title>Saldo en Bancos</Card.Title>
                                    <h3>{data.totales.bancos.toFixed(2)} €</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-white bg-info shadow-sm">
                                <Card.Body className="text-center">
                                    <Card.Title>Saldo en Cajas</Card.Title>
                                    <h3>{data.totales.cajas.toFixed(2)} €</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-white bg-success shadow-sm">
                                <Card.Body className="text-center">
                                    <Card.Title>Liquidez Total</Card.Title>
                                    <h3>{data.totales.global.toFixed(2)} €</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Tabla de Bancos */}
                    <h4 className="mt-4"><i className="bi bi-bank"></i> Cuentas Bancarias</h4>
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead className="table-dark">
                        <tr>
                            <th>Entidad</th>
                            <th>IBAN</th>
                            <th>Comunidad / Titular</th>
                            <th className="text-end">Saldo Actual</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.bancos.length > 0 ? data.bancos.map((b: any) => (
                            <tr key={b._id}>
                                <td>{b.nombreEntidad}</td>
                                <td><code>{b.iban}</code></td>
                                <td>{b.comunidad?.nombre || 'Administración'}</td>
                                <td className={`text-end fw-bold ${b.saldoActual < 0 ? 'text-danger' : ''}`}>
                                    {b.saldoActual.toFixed(2)} €
                                </td>
                            </tr>
                        )) : <tr><td colSpan={4} className="text-center">No hay cuentas bancarias registradas</td></tr>}
                        </tbody>
                    </Table>

                    {/* Tabla de Cajas */}
                    <h4 className="mt-4"><i className="bi bi-cash-stack"></i> Cajas de Efectivo</h4>
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead className="table-secondary">
                        <tr>
                            <th>Nombre de Caja</th>
                            <th>Responsable</th>
                            <th>Asociada a</th>
                            <th className="text-end">Saldo Actual</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.cajas.length > 0 ? data.cajas.map((c: any) => (
                            <tr key={c._id}>
                                <td>{c.nombre}</td>
                                <td>{c.responsable?.nombre || 'S/A'}</td>
                                <td>{c.comunidad?.nombre || 'Administración'}</td>
                                <td className={`text-end fw-bold ${c.saldoActual < 0 ? 'text-danger' : ''}`}>
                                    {c.saldoActual.toFixed(2)} €
                                </td>
                            </tr>
                        )) : <tr><td colSpan={4} className="text-center">No hay cajas de efectivo registradas</td></tr>}
                        </tbody>
                    </Table>
                </>
            )}
        </Container>
    );
};

export default Tesoreria;