import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ProveedorService } from '../../services/ProveedorService';
import { ComunidadService } from '../../services/ComunidadService';
import type {Proveedor} from '../../models/Proveedor';

const GestionProveedores: React.FC = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevoProveedor, setNuevoProveedor] = useState<Proveedor>({
        nombre: '',
        nif: '',
        direccion: '',
        poblacion: '',
        cp: '',
        tipoServicio: 'Limpieza',
        actividad: '',
        telefono: '',
        email: ''
    });
    const [showFacturaModal, setShowFacturaModal] = useState(false);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(null);
    const [datosFactura, setDatosFactura] = useState({
        comunidadId: '',
        importeTotal: 0,
        concepto: ''
    });

    const handleLoad = async () => {
        const [dataP, dataC] = await Promise.all([
            ProveedorService.getAll(),
            ComunidadService.getAll()
        ]);
        setProveedores(dataP);
        setComunidades(dataC);
    };

    const handleOpenFactura = (proveedor: Proveedor) => {
        setCurrentProveedor(proveedor);
        setShowFacturaModal(true);
    };

    const handleSubmitFactura = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ProveedorService.createFactura({
                ...datosFactura,
                proveedorId: currentProveedor?._id
            });
            alert('Gasto repartido con éxito entre todos los propietarios.');
            setShowFacturaModal(false);
        } catch (error) {
            alert('Error al repartir el gasto.');
        }
    };

    useEffect(() => { handleLoad(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await ProveedorService.create(nuevoProveedor);
        setShowModal(false);
        handleLoad();
    };

    return (
        <Container fluid className="px-4 mt-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-3">
                    <h4 className="text-primary mb-0 small font-weight-bold">Mantenimiento de Proveedores</h4>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                    >
                        <i className="bi bi-arrow-left me-1"></i> Volver
                    </Button>
                </div>
                <Button variant="success" size="sm" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg"></i> Nuevo Proveedor
                </Button>
            </div>

            <Table striped hover size="sm" style={{ fontSize: '0.8rem' }}>
                <thead className="table-dark">
                <tr>
                    <th>Nombre / Empresa</th>
                    <th>CIF</th>
                    <th>Servicio</th>
                    <th>Contacto</th>
                    <th className="text-center">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {proveedores.map(p => (
                    <tr key={p._id}>
                        <td>{p.nombre}</td>
                        <td>{p.nif}</td>
                        <td><Badge bg="info" className="text-dark">{p.tipoServicio}</Badge></td>
                        <td>{p.telefono} | {p.email}</td>
                        <td className="text-center">
                            <Button
                                variant="outline-primary" size="sm" className="py-0 px-2 small"
                                onClick={() => handleOpenFactura(p)}
                            >
                                Facturas
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {/* MODAL DE ALTA */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="py-2"><Modal.Title className="h6">Nuevo Proveedor</Modal.Title></Modal.Header>
                <Modal.Body className="py-2">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-2">
                            <Col md={8}>
                                <Form.Group><Form.Label className="small mb-0">Nombre Comercial</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.nombre} onChange={e => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})} /></Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label className="small mb-0">CIF/NIF</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.nif} onChange={e => setNuevoProveedor({...nuevoProveedor, nif: e.target.value})} /></Form.Group>
                            </Col>
                        </Row>

                        <Row className="g-2 mt-1">
                            <Col md={6}>
                                <Form.Group><Form.Label className="small mb-0">Dirección</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.direccion} onChange={e => setNuevoProveedor({...nuevoProveedor, direccion: e.target.value})} /></Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label className="small mb-0">Población</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.poblacion} onChange={e => setNuevoProveedor({...nuevoProveedor, poblacion: e.target.value})} /></Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group><Form.Label className="small mb-0">CP</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.cp} onChange={e => setNuevoProveedor({...nuevoProveedor, cp: e.target.value})} /></Form.Group>
                            </Col>
                        </Row>

                        <Row className="g-2 mt-1">
                            <Col md={4}>
                                <Form.Group><Form.Label className="small mb-0">Tipo de Servicio</Form.Label>
                                    <Form.Select size="sm" value={nuevoProveedor.tipoServicio} onChange={e => setNuevoProveedor({...nuevoProveedor, tipoServicio: e.target.value})}>
                                        <option value="Limpieza">Limpieza</option><option value="Fontanería">Fontanería</option>
                                        <option value="Electricidad">Electricidad</option><option value="Ascensores">Ascensores</option>
                                        <option value="Seguros">Seguros</option><option value="Otros">Otros</option>
                                    </Form.Select></Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label className="small mb-0">Actividad</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.actividad} onChange={e => setNuevoProveedor({...nuevoProveedor, actividad: e.target.value})} /></Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label className="small mb-0">Teléfono</Form.Label>
                                    <Form.Control size="sm" required value={nuevoProveedor.telefono} onChange={e => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})} /></Form.Group>
                            </Col>
                        </Row>

                        <Row className="g-2 mt-1">
                            <Col md={12}>
                                <Form.Group><Form.Label className="small mb-0">Email</Form.Label>
                                    <Form.Control size="sm" type="email" required value={nuevoProveedor.email} onChange={e => setNuevoProveedor({...nuevoProveedor, email: e.target.value})} /></Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end mt-3">
                            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} className="me-2">Cancelar</Button>
                            <Button variant="primary" size="sm" type="submit">Guardar Proveedor</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showFacturaModal} onHide={() => setShowFacturaModal(false)} centered>
                <Modal.Header closeButton className="py-2"><Modal.Title className="h6">Registrar Factura / Gasto</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitFactura}>
                        <p className="small text-muted mb-2">Proveedor: <strong>{currentProveedor?.nombre}</strong></p>
                        <Form.Group className="mb-2">
                            <Form.Label className="small mb-0">Comunidad</Form.Label>
                            <Form.Select size="sm" required onChange={e => setDatosFactura({...datosFactura, comunidadId: e.target.value})}>
                                <option value="">Seleccione Comunidad...</option>
                                {comunidades.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label className="small mb-0">Importe Total (IVA incluido)</Form.Label>
                            <Form.Control size="sm" type="number" step="0.01" required onChange={e => setDatosFactura({...datosFactura, importeTotal: Number(e.target.value)})} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label className="small mb-0">Concepto / Descripción</Form.Label>
                            <Form.Control size="sm" as="textarea" rows={2} required onChange={e => setDatosFactura({...datosFactura, concepto: e.target.value})} />
                        </Form.Group>
                        <div className="text-end mt-3">
                            <Button variant="primary" size="sm" type="submit">Generar Reparto por Coeficiente</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default GestionProveedores;