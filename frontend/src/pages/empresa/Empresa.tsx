import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { EmpresaService } from '../../services/EmpresaService';
import { ComunidadService } from '../../services/ComunidadService';
import { MovimientoService } from '../../services/MovimientoService';
import { useNavigate } from 'react-router-dom';

const Empresa: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [empresa, setEmpresa] = useState<any>(null);

    const [comunidades, setComunidades] = useState<any[]>([]);
    const [showFacturaModal, setShowFacturaModal] = useState(false);
    const [facturaData, setFacturaData] = useState({
        comunidadId: '',
        concepto: 'Honorarios Administración Mes...',
        baseImponible: '',
        tipoIva: '21'
    });

    const [formData, setFormData] = useState({
        nombre: '',
        cif: '',
        telefono: '',
        email: ''
    });

    const fetchEmpresa = async () => {
        try {
            setLoading(true);
            const [data, coms] = await Promise.all([
                EmpresaService.getAll(),
                ComunidadService.getAll()
            ]);
            setComunidades(coms);

            if (data && data.length > 0) {
                setEmpresa(data[0]);
                setFormData({
                    nombre: data[0].nombre,
                    cif: data[0].cif || '',
                    telefono: data[0].telefono || '',
                    email: data[0].email || ''
                });
            }
        } catch (err) {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpresa();
    }, []);

    const handleGenerarFactura = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await MovimientoService.generarFacturaServicio({
                ...facturaData,
                nombreEmpresa: empresa.nombre // Enviamos el titular
            });
            alert('Factura generada con éxito');
            setShowFacturaModal(false);
            setFacturaData({ comunidadId: '', concepto: 'Honorarios Administración Mes...', baseImponible: '', tipoIva: '21' });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (empresa) {
                // Si ya existe, actualizamos (necesitarás el método update en el service)
                // await EmpresaService.update(empresa._id, formData);
            } else {
                // Si no existe, creamos
                await EmpresaService.create(formData);
            }
            setIsEditing(false);
            fetchEmpresa();
        } catch (err) {
            setError('Error al guardar los datos');
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    const totalCalculado = (Number(facturaData.baseImponible) * (1 + Number(facturaData.tipoIva) / 100)).toFixed(2);

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de la Administración</h2>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>Volver</Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {(!empresa || isEditing) ? (
                <Card className="shadow-sm">
                    <Card.Body>
                        <Card.Title className="mb-4">{empresa ? 'Editar Datos' : 'Configurar Nueva Administración'}</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Form.Group as={Col} md="6" className="mb-3">
                                    <Form.Label>Nombre Comercial</Form.Label>
                                    <Form.Control
                                        name="nombre" value={formData.nombre}
                                        onChange={handleChange} required
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="6" className="mb-3">
                                    <Form.Label>CIF / NIF</Form.Label>
                                    <Form.Control
                                        name="cif" value={formData.cif} onChange={handleChange}
                                    />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="6" className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        name="telefono" value={formData.telefono} onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} md="6" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email" name="email" value={formData.email} onChange={handleChange}
                                    />
                                </Form.Group>
                            </Row>
                            <Button type="submit" variant="primary" className="me-2">Guardar Datos</Button>
                            {empresa && <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>}
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="shadow-sm">
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={4} className="fw-bold">Nombre Comercial:</Col>
                            <Col md={8}>{empresa.nombre}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4} className="fw-bold">CIF:</Col>
                            <Col md={8}>{empresa.cif || '---'}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4} className="fw-bold">Teléfono:</Col>
                            <Col md={8}>{empresa.telefono || '---'}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4} className="fw-bold">Email:</Col>
                            <Col md={8}>{empresa.email || '---'}</Col>
                        </Row>
                        <Button variant="primary" onClick={() => setIsEditing(true)}>Modificar Datos</Button>

                        {/* NUEVO BOTÓN */}
                        <Button variant="success" className="ms-2" onClick={() => setShowFacturaModal(true)}>
                            + Generar Factura de Servicios
                        </Button>
                    </Card.Body>
                </Card>
            )}

            {/* MODAL PARA GENERAR FACTURA (UBICADO ANTES DEL CIERRE DE CONTAINER) */}
            <Modal show={showFacturaModal} onHide={() => setShowFacturaModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Nueva Factura de Servicios</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleGenerarFactura}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Comunidad Destino</Form.Label>
                            <Form.Select
                                value={facturaData.comunidadId}
                                onChange={e => setFacturaData({...facturaData, comunidadId: e.target.value})}
                                required
                            >
                                <option value="">Seleccione comunidad...</option>
                                {comunidades.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Concepto</Form.Label>
                            <Form.Control
                                value={facturaData.concepto}
                                onChange={e => setFacturaData({...facturaData, concepto: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Importe Total (€)</Form.Label>
                                    <Form.Control
                                        type="number" step="0.01"
                                        value={facturaData.baseImponible}
                                        onChange={e => setFacturaData({...facturaData, baseImponible: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>% IVA</Form.Label>
                                    <Form.Select
                                        value={facturaData.tipoIva}
                                        onChange={e => setFacturaData({...facturaData, tipoIva: e.target.value})}
                                    >
                                        <option value="21">21%</option>
                                        <option value="10">10%</option>
                                        <option value="4">4%</option>
                                        <option value="0">0% (Exento)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="bg-light p-2 rounded border text-end">
                            <strong>Total Factura (con IVA): </strong>
                            <span className="text-success fs-5">{totalCalculado} €</span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowFacturaModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="success">Emitir Factura</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Empresa;