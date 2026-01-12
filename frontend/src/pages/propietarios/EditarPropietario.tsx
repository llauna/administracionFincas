import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Button, Tabs, Tab, Row, Col, Alert } from "react-bootstrap";
import { type PropietarioDTO } from "../../models/Propietario";
import { PropietarioService } from "../../services/PropietarioService";
import { EmpresaService } from "../../services/EmpresaService";
import { ComunidadService } from "../../services/ComunidadService";
import { PropiedadService } from "../../services/PropiedadService";

const EditarPropietario = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<PropietarioDTO>({
        nombre: "",
        telefono: "",
        email: "",
        gestorFinca: "",
        comunidades: []
    });

    const [empresas, setEmpresas] = useState<any[]>([]);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [propiedadesDisponibles, setPropiedadesDisponibles] = useState<any[]>([]);
    const [propiedadSeleccionadaId, setPropiedadSeleccionadaId] = useState("");

    const [activeTab, setActiveTab] = useState('datosPersonales');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) throw new Error("ID no proporcionado");

                const [propietarioData, empresasData, comunidadesData] = await Promise.all([
                    PropietarioService.getById(id),
                    EmpresaService.getAll(),
                    ComunidadService.getAll()
                ]);

                // CORRECCIÓN LÍNEA 46: Acceso seguro al gestor y comunidades
                const gestorId = propietarioData.gestorFinca && typeof propietarioData.gestorFinca === 'object'
                    ? (propietarioData.gestorFinca as any)._id
                    : propietarioData.gestorFinca || "";

                const dto: PropietarioDTO = {
                    nombre: propietarioData.nombre,
                    telefono: propietarioData.telefono || "",
                    email: propietarioData.email || "",
                    gestorFinca: gestorId,
                    comunidades: Array.isArray(propietarioData.comunidades)
                        ? propietarioData.comunidades.map((c: any) => typeof c === 'object' ? c._id : c)
                        : []
                };

                setFormData(dto);
                setEmpresas(empresasData);
                setComunidades(comunidadesData);

                if (dto.comunidades.length > 0) {
                    const props = await PropiedadService.getByComunidad(dto.comunidades[0]);
                    setPropiedadesDisponibles(props || []);
                    const asignada = props.find((p: any) =>
                        (p.propietario?._id || p.propietario) === id
                    );
                    if (asignada) setPropiedadSeleccionadaId(asignada._id);
                }
            } catch (err: any) {
                setError("Error al cargar datos: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const updatePisos = async () => {
            if (formData.comunidades.length > 0 && !loading) {
                try {
                    const props = await PropiedadService.getByComunidad(formData.comunidades[0]);
                    setPropiedadesDisponibles(props || []);
                } catch (err) {
                    console.error("Error cargando pisos");
                }
            }
        };
        updatePisos();
    }, [formData.comunidades]);

    // CORRECCIÓN OnChange: Tipado explícito para React Bootstrap
    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PropietarioService.update(id!, formData);
            if (propiedadSeleccionadaId) {
                await PropiedadService.update(propiedadSeleccionadaId, {
                    propietario: id,
                    estado: 'ocupado'
                } as any);
            }
            navigate('/propietarios');
        } catch (err: any) {
            setError("Error al actualizar: " + err.message);
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <Container className="mt-4">
            <h4 className="text-primary mb-4 font-weight-bold">Editar Propietario: {formData.nombre}</h4>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'datosPersonales')} className="mb-3">
                    <Tab eventKey="datosPersonales" title="Datos Personales">
                        <div className="card p-3 shadow-sm border-0 bg-light">
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="small fw-bold">Nombre</Form.Label>
                                    <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label className="small fw-bold">Teléfono</Form.Label>
                                    <Form.Control name="telefono" value={formData.telefono} onChange={handleChange} />
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Email</Form.Label>
                                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Gestor de Finca</Form.Label>
                                <Form.Select name="gestorFinca" value={formData.gestorFinca} onChange={handleChange} required>
                                    <option value="">Seleccionar gestor</option>
                                    {empresas.map(emp => <option key={emp._id} value={emp._id}>{emp.nombre}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </Tab>

                    <Tab eventKey="asignacion" title="Asignación de Piso">
                        <div className="card p-3 shadow-sm border-0 bg-light">
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">1. Comunidad</Form.Label>
                                <Form.Select
                                    value={formData.comunidades[0] || ''}
                                    onChange={(e: React.ChangeEvent<any>) => setFormData({...formData, comunidades: [e.target.value]})}
                                >
                                    <option value="">-- Seleccione Comunidad --</option>
                                    {comunidades.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">2. Piso / Local asignado</Form.Label>
                                <Form.Select
                                    value={propiedadSeleccionadaId}
                                    onChange={(e: React.ChangeEvent<any>) => setPropiedadSeleccionadaId(e.target.value)}
                                    disabled={formData.comunidades.length === 0}
                                >
                                    <option value="">-- Sin asignar / Seleccione piso --</option>
                                    {propiedadesDisponibles.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.tipo.toUpperCase()}: Planta {p.piso} - Puerta {p.puerta}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </Tab>
                </Tabs>

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="outline-secondary" onClick={() => navigate('/propietarios')}>Cancelar</Button>
                    <Button variant="primary" type="submit">Guardar Cambios</Button>
                </div>
            </Form>
        </Container>
    );
};

export default EditarPropietario;