import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ProveedorService } from '../../services/ProveedorService';
import { ComunidadService } from '../../services/ComunidadService';
import type { Proveedor } from '../../models/Proveedor';

const GestionProveedores: React.FC = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [nuevoProveedor, setNuevoProveedor] = useState<Proveedor>({
        nombre: '', nif: '', direccion: '', poblacion: '', cp: '',
        tipoServicio: 'Limpieza', actividad: '', telefono: '', email: ''
    });

    const [showFacturaModal, setShowFacturaModal] = useState(false);
    const [modoEdicionFactura, setModoEdicionFactura] = useState(false);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(null);

    const [datosFactura, setDatosFactura] = useState({
        comunidadId: '', tipo: 'factura' as 'factura' | 'nota_gasto',
        numeroFactura: '', importeBase: 0, iva: 21, importeTotal: 0, concepto: ''
    });

    const [facturasProveedor, setFacturasProveedor] = useState<any[]>([]);
    const [detallesReparto, setDetallesReparto] = useState<any[]>([]);
    const [showDetalleModal, setShowDetalleModal] = useState(false);

    const handleLoad = async () => {
        try {
            const [dataP, dataC] = await Promise.all([
                ProveedorService.getAll(),
                ComunidadService.getAll()
            ]);
            setProveedores(dataP);
            setComunidades(dataC);
        } catch (err) {
            setError("Error al cargar datos iniciales.");
        }
    };

    const cargarFacturas = async (proveedorId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/movimientos/proveedor/${proveedorId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                // Aseguramos que el comunidadId esté presente para el recalcular
                const formateados = data.map(f => ({
                    ...f,
                    comunidadId: f.comunidadId || (f.reparto && f.reparto[0]?.comunidad)
                }));
                setFacturasProveedor(formateados);
            }
        } catch (error) {
            console.error("Error cargando facturas", error);
        }
    };

    const handleOpenFactura = async (proveedor: Proveedor) => {
        setCurrentProveedor(proveedor);
        setModoEdicionFactura(false);
        await cargarFacturas(proveedor._id!);
        setDatosFactura({
            comunidadId: '', tipo: 'factura', numeroFactura: '',
            importeBase: 0, iva: 21, importeTotal: 0, concepto: ''
        });
        setShowFacturaModal(true);
    };

    const handleVerDetalle = (factura: any) => {
        setDetallesReparto(factura.reparto || []);
        setShowDetalleModal(true);
    };

    const handleRecalcular = async (f: any) => {
        if (window.confirm(`¿Deseas recalcular el reparto de "${f._id}"?`)) {
            try {
                const cId = f.comunidadId;
                if (!cId) throw new Error("No se encontró el ID de la comunidad.");

                await fetch(`http://localhost:5000/api/movimientos/bulk-delete`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ descripcion: f._id, proveedorId: currentProveedor?._id })
                });

                const soloConcepto = f._id.split(' (Factura:')[0];
                const soloNumero = f._id.match(/\(Factura: (.*?)\)/)?.[1] || "";

                await ProveedorService.createFactura({
                    comunidadId: cId,
                    proveedorId: currentProveedor?._id,
                    concepto: soloConcepto,
                    numeroFactura: soloNumero,
                    importeTotal: f.importeTotal,
                    tipo: 'factura'
                });

                alert("Reparto recalculado.");
                await cargarFacturas(currentProveedor?._id!);
            } catch (err: any) {
                setError("Error al recalcular: " + err.message);
            }
        }
    };

    const handleDeleteFactura = async (facturaGroup: any) => {
        if (window.confirm(`¿Seguro que quieres eliminar la factura "${facturaGroup._id}"?`)) {
            try {
                await fetch(`http://localhost:5000/api/movimientos/bulk-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ descripcion: facturaGroup._id, proveedorId: currentProveedor?._id })
                });
                await cargarFacturas(currentProveedor!._id!);
            } catch (err) {
                setError("No se pudo eliminar.");
            }
        }
    };

    const handleSubmitFactura = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const conceptoUnico = `${datosFactura.concepto} (Factura: ${datosFactura.numeroFactura})`;
            await ProveedorService.createFactura({ ...datosFactura, concepto: conceptoUnico, proveedorId: currentProveedor?._id });
            alert('Gasto registrado con éxito.');
            setModoEdicionFactura(false);
            await cargarFacturas(currentProveedor?._id!);
        } catch (error) {
            setError("Error al registrar factura.");
        }
    };

    const recalcularTotales = (base: number, iva: number, tipo: string) => {
        const total = tipo === 'factura' ? base * (1 + iva / 100) : base;
        setDatosFactura(prev => ({
            ...prev, importeBase: base, iva: tipo === 'factura' ? iva : 0,
            importeTotal: Number(total.toFixed(2)), tipo: tipo as any
        }));
    };

    useEffect(() => { handleLoad(); }, []);

    const handleSubmitProveedor = async (e: React.FormEvent) => {
        e.preventDefault();
        await ProveedorService.create(nuevoProveedor);
        setShowModal(false);
        handleLoad();
    };

    return (
        <Container fluid className="px-4 mt-2">
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                    <h4 className="text-primary mb-0 font-weight-bold">Mantenimiento de Proveedores</h4>
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard')}>
                        <i className="bi bi-arrow-left"></i> Volver
                    </Button>
                </div>
                <Button variant="success" size="sm" onClick={() => setShowModal(true)}>Nuevo Proveedor</Button>
            </div>

            <Table striped hover size="sm" style={{ fontSize: '0.85rem' }}>
                <thead className="table-dark">
                <tr><th>Nombre Comercial</th><th>CIF</th><th>Servicio</th><th className="text-center">Acciones</th></tr>
                </thead>
                <tbody>
                {proveedores.map(p => (
                    <tr key={p._id}>
                        <td>{p.nombre}</td><td>{p.nif}</td>
                        <td><Badge bg="info" className="text-dark">{p.tipoServicio}</Badge></td>
                        <td className="text-center">
                            <Button variant="outline-primary" size="sm" onClick={() => handleOpenFactura(p)}>Facturas / Histórico</Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Modal show={showFacturaModal} onHide={() => setShowFacturaModal(false)} size="xl" centered>
                <Modal.Header closeButton className="py-2 bg-light">
                    <Modal.Title className="h6">Gestión de Facturas: {currentProveedor?.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body className={modoEdicionFactura ? 'py-3' : 'p-0'}>
                    {!modoEdicionFactura ? (
                        <>
                            <div className="p-2 d-flex justify-content-end bg-light border-bottom">
                                <Button variant="success" size="sm" onClick={() => setModoEdicionFactura(true)}>+ Registrar Factura</Button>
                            </div>
                            <Table striped hover size="sm" className="mb-0" style={{ fontSize: '0.8rem' }}>
                                <thead className="table-light">
                                <tr>
                                    <th style={{ width: '90px' }}>Fecha</th>
                                    <th style={{ width: '40%' }}>Concepto / Nº</th>
                                    <th className="text-end" style={{ width: '100px' }}>Total</th>
                                    <th className="text-center" style={{ width: '200px' }}>Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {facturasProveedor.length > 0 ? facturasProveedor.map((f, i) => (
                                    <tr key={i} className="align-middle">
                                        <td>{new Date(f.fecha).toLocaleDateString()}</td>
                                        <td>
                                            <Button variant="link" className="p-0 text-decoration-none fw-bold" onClick={() => handleVerDetalle(f)}>
                                                {f._id} <i className="bi bi-eye ms-1"></i>
                                            </Button>
                                        </td>
                                        <td className="fw-bold text-end pe-3 text-danger">{Number(f.importeTotal).toFixed(2)}€</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button variant="warning" size="sm" onClick={() => handleRecalcular(f)} title="Recalcular"><i className="bi bi-arrow-repeat"></i>Recalcular</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteFactura(f)} title="Borrar"><i className="bi bi-trash"></i>Borrar</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-4 text-muted">Sin facturas registradas</td></tr>
                                )}
                                </tbody>
                            </Table>
                        </>
                    ) : (
                        <Form onSubmit={handleSubmitFactura} className="px-4 py-3">
                            <Row className="g-3">
                                <Col md={6}><Form.Label className="small mb-0 fw-bold">Comunidad</Form.Label>
                                    <Form.Select size="sm" required value={datosFactura.comunidadId} onChange={e => setDatosFactura({...datosFactura, comunidadId: e.target.value})}>
                                        <option value="">Seleccione...</option>{comunidades.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                                    </Form.Select></Col>
                                <Col md={6}><Form.Label className="small mb-0 fw-bold">Tipo</Form.Label>
                                    <Form.Select size="sm" value={datosFactura.tipo} onChange={e => recalcularTotales(datosFactura.importeBase, datosFactura.iva, e.target.value)}>
                                        <option value="factura">Factura</option><option value="nota_gasto">Nota Gasto</option>
                                    </Form.Select></Col>
                            </Row>
                            <Row className="g-3 mt-1">
                                <Col md={4}><Form.Label className="small mb-0">Nº Factura</Form.Label><Form.Control size="sm" required value={datosFactura.numeroFactura} onChange={e => setDatosFactura({...datosFactura, numeroFactura: e.target.value})} /></Col>
                                <Col md={4}><Form.Label className="small mb-0">Base (€)</Form.Label><Form.Control size="sm" type="number" step="0.01" required value={datosFactura.importeBase} onChange={e => recalcularTotales(Number(e.target.value), datosFactura.iva, datosFactura.tipo)} /></Col>
                                <Col md={4}><Form.Label className="small mb-0">IVA %</Form.Label><Form.Control size="sm" type="number" disabled={datosFactura.tipo === 'nota_gasto'} value={datosFactura.iva} onChange={e => recalcularTotales(datosFactura.importeBase, Number(e.target.value), datosFactura.tipo)} /></Col>
                            </Row>
                            <div className="p-3 bg-light border rounded mt-3 text-end">Total: <strong className="text-primary h4 mb-0">{datosFactura.importeTotal.toFixed(2)}€</strong></div>
                            <Form.Group className="mt-3"><Form.Label className="small mb-0 fw-bold">Concepto</Form.Label><Form.Control size="sm" as="textarea" rows={2} required value={datosFactura.concepto} onChange={e => setDatosFactura({...datosFactura, concepto: e.target.value})} /></Form.Group>
                            <div className="d-flex justify-content-between mt-4"><Button variant="secondary" onClick={() => setModoEdicionFactura(false)}>Volver</Button><Button variant="primary" type="submit">Generar Reparto</Button></div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg" centered>
                <Modal.Header closeButton className="py-2 bg-primary text-white"><Modal.Title className="h6">Desglose de Reparto</Modal.Title></Modal.Header>
                <Modal.Body className="p-0">
                    <Table striped hover size="sm" className="mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-light"><tr><th>Propiedad</th><th className="text-end">Cuota (€)</th></tr></thead>
                        <tbody>
                        {detallesReparto.map((d, i) => (
                            <tr key={i}><td>Piso {d.piso || '-'} - Pta {d.puerta || '-'}</td><td className="text-end fw-bold">{Number(d.importe || 0).toFixed(2)}€</td></tr>
                        ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title className="h6">Nuevo Proveedor</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitProveedor}>
                        <Form.Label className="small">Nombre</Form.Label><Form.Control size="sm" required value={nuevoProveedor.nombre} onChange={e => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})} />
                        <div className="text-end mt-3"><Button variant="primary" size="sm" type="submit">Guardar</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default GestionProveedores;