import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PropietarioService } from "../../services/PropietarioService";
import { EmpresaService } from "../../services/EmpresaService";
import { ComunidadService } from "../../services/ComunidadService";
import { PropiedadService } from "../../services/PropiedadService";
import type { PropietarioDTO } from "../../models/Propietario";
import type { PropiedadDTO } from "../../models/Propiedad";
import { Button, Tabs, Tab, Modal, Form } from "react-bootstrap";
import NuevaComunidad from '../comunidades/NuevaComunidad';

const NuevoPropietario = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('datosPersonales');
    const [formData, setFormData] = useState<Omit<PropietarioDTO, '_id'>>({
        nombre: "",
        telefono: "",
        email: "",
        gestorFinca: "",
        comunidades: []
    });

    // Update the estado to match the expected type
    const [propiedadData, setPropiedadData] = useState<Omit<PropiedadDTO, '_id' | 'comunidad' | 'propietario'>>({
        referencia: "",
        direccion: "",
        piso: "",
        portal: "",
        puerta: "",
        tipo: "piso",    // Changed from "Piso" to match the type
        estado: "disponible",
        // Add other optional fields as needed
        codigoPostal: "",
        ciudad: "",
        provincia: "",
        pais: "España",
        metrosCuadrados: 0,
        numHabitaciones: 0,
        numBanos: 1
    });

    const [empresas, setEmpresas] = useState<any[]>([]);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [propiedadesDisponibles, setPropiedadesDisponibles] = useState<any[]>([]);
    const [propiedadSeleccionadaId, setPropiedadSeleccionadaId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModalComunidad, setShowModalComunidad] = useState(false);
    const [validated, setValidated] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empresasData, comunidadesData] = await Promise.all([
                    EmpresaService.getAll(),
                    ComunidadService.getAll()
                ]);
                setEmpresas(empresasData);
                setComunidades(comunidadesData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                setError("Error al cargar los datos necesarios");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchPropiedades = async () => {
            if (formData.comunidades.length > 0) {
                try {
                    const data = await PropiedadService.getByComunidad(formData.comunidades[0]);
                    // Filtramos solo las que no tienen propietario aún (opcional)
                    setPropiedadesDisponibles(data);
                } catch (error) {
                    console.error("Error al cargar propiedades de la comunidad:", error);
                }
            }
        };
        fetchPropiedades();
    }, [formData.comunidades]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePropiedadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "idSeleccionado") {
            const prop = propiedadesDisponibles.find(p => p._id === value);
            if (prop) {
                setPropiedadSeleccionadaId(value);
                setPropiedadData(prev => ({
                    ...prev,
                    referencia: prop.referencia || "",
                    direccion: prop.direccion || "",
                    piso: prop.piso || "",
                    portal: prop.portal || "",
                    puerta: prop.puerta || "",
                    tipo: prop.tipo || "piso",
                    metrosCuadrados: prop.metrosCuadrados || 0
                }));
            }
        } else {
            setPropiedadData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleComunidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        setFormData(prev => ({ ...prev, comunidades: selectedValues }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;

        if (!form.checkValidity()) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            // 1. Crear el propietario
            const propietarioCreado = await PropietarioService.create({
                ...formData,
                comunidades: Array.isArray(formData.comunidades)
                    ? formData.comunidades
                    : [formData.comunidades].filter(Boolean)
            });

            // 2. Si se seleccionó una propiedad existente, la vinculamos
            if (propiedadSeleccionadaId) {
                await PropiedadService.update(propiedadSeleccionadaId, {
                    ...propiedadData,
                    comunidad: formData.comunidades[0],
                    propietario: propietarioCreado._id,
                    estado: 'alquilado' // O el estado que prefieras al asignar dueño
                } as any);
            }

            navigate('/propietarios');

        } catch (error) {
            console.error("Error al crear propietario:", error);
            setError("Error al crear el propietario: " + (error as Error).message);
        }
    };

    const refreshComunidades = async () => {
        try {
            const data = await ComunidadService.getAll();
            setComunidades(data);
            setShowModalComunidad(false);
        } catch (err) {
            console.error("Error al refrescar comunidades", err);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Nuevo Propietario</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k || 'datosPersonales')}
                    className="mb-3"
                >
                    <Tab eventKey="datosPersonales" title="Datos Personales">
                        <div className="card mt-3">
                            <div className="card-body">
                                <h5 className="card-title">Datos del Propietario</h5>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <Form.Group controlId="formNombre">
                                            <Form.Label>Nombre *</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Por favor ingrese el nombre.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <Form.Group controlId="formTelefono">
                                            <Form.Label>Teléfono</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <Form.Group controlId="formEmail">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <Form.Group controlId="formGestor">
                                            <Form.Label>Gestor de Finca *</Form.Label>
                                            <Form.Select
                                                required name="gestorFinca" value={formData.gestorFinca}
                                                onChange={handleChange}
                                            >
                                                <option value="">Seleccionar gestor</option>
                                                {empresas.map(empresa => (
                                                    <option key={empresa._id} value={empresa._id}>
                                                        {empresa.nombre}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                Por favor seleccione un gestor.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab>

                    <Tab eventKey="comunidades" title="Comunidades" disabled={!formData.nombre || !formData.gestorFinca}>
                        <div className="card mt-3">
                            <div className="card-body">
                                <h5 className="card-title">Comunidades</h5>
                                <div className="mb-3">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowModalComunidad(true);
                                        }}
                                        className="mb-2"
                                    >
                                        + Nueva Comunidad
                                    </Button>
                                    <Form.Group controlId="formComunidades">
                                        <Form.Label>Seleccionar Comunidades *</Form.Label>
                                        <Form.Select
                                            multiple required name="comunidades"
                                            value={formData.comunidades} onChange={handleComunidadChange}
                                        >
                                            {comunidades.map(comunidad => (
                                                <option key={comunidad._id} value={comunidad._id}>
                                                    {comunidad.nombre}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text>
                                            Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples comunidades
                                        </Form.Text>
                                    </Form.Group>
                                </div>
                            </div>
                        </div>
                    </Tab>

                    <Tab eventKey="propiedad" title="Propiedad" disabled={formData.comunidades.length === 0}>
                        <div className="card mt-3">
                            <div className="card-body">
                                <h5 className="card-title">Datos de la Propiedad</h5>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Seleccionar Propiedad Existente</Form.Label>
                                    <Form.Select
                                        name="idSeleccionado"
                                        value={propiedadSeleccionadaId}
                                        onChange={handlePropiedadChange}
                                    >
                                        <option value="">-- Seleccione un Piso/Local de la lista --</option>
                                        {propiedadesDisponibles.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.tipo.toUpperCase()}: Piso {p.piso} - Puerta {p.puerta} ({p.referencia})
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Elija la propiedad que ha sido generada automáticamente para esta comunidad.
                                    </Form.Text>
                                </Form.Group>

                                <hr />

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <Form.Group controlId="formTipo">
                                            <Form.Label>Tipo de Propiedad</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="tipo"
                                                value={propiedadData.tipo}
                                                readOnly
                                                disabled
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <Form.Group controlId="formReferencia">
                                            <Form.Control
                                                type="text"
                                                name="referencia"
                                                value={propiedadData.referencia}
                                                onChange={handlePropiedadChange}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <Form.Group controlId="formDireccionPropiedad">
                                            <Form.Label>Dirección de la Propiedad *</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="direccion"
                                                value={propiedadData.direccion}
                                                onChange={handlePropiedadChange}
                                                placeholder="Calle, número, etc."
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                La dirección es obligatoria.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <Form.Group controlId="formSuperficie">
                                            <Form.Label>Superficie (m²)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                name="metrosCuadrados"
                                                value={propiedadData.metrosCuadrados}
                                                onChange={handlePropiedadChange}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-2 mb-3">
                                        <Form.Group controlId="formPortal">
                                            <Form.Label>Portal</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="portal"
                                                value={propiedadData.portal || ''}
                                                onChange={handlePropiedadChange}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <Form.Group controlId="formPiso">
                                            <Form.Label>Piso</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="piso"
                                                value={propiedadData.piso}
                                                onChange={handlePropiedadChange}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <Form.Group controlId="formPuerta">
                                            <Form.Label>Puerta</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="puerta"
                                                value={propiedadData.puerta}
                                                onChange={handlePropiedadChange}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Tab>
                </Tabs>

                <div className="d-flex justify-content-between mt-4">
                    <div>
                        {activeTab === 'comunidades' && (
                            <Button
                                variant="secondary"
                                className="me-2"
                                onClick={() => setActiveTab('datosPersonales')}
                            >
                                Anterior
                            </Button>
                        )}
                        {activeTab === 'propiedad' && (
                            <Button
                                variant="secondary"
                                className="me-2"
                                onClick={() => setActiveTab('comunidades')}
                            >
                                Anterior
                            </Button>
                        )}
                    </div>

                    <div>
                        {activeTab === 'datosPersonales' && (
                            <Button
                                variant="primary"
                                onClick={() => setActiveTab('comunidades')}
                                disabled={!formData.nombre || !formData.gestorFinca}
                            >
                                Siguiente
                            </Button>
                        )}
                        {activeTab === 'comunidades' && (
                            <Button
                                variant="primary"
                                onClick={() => setActiveTab('propiedad')}
                                disabled={formData.comunidades.length === 0}
                            >
                                Siguiente
                            </Button>
                        )}
                        {activeTab === 'propiedad' && (
                            <Button variant="success" type="submit">
                                Guardar Propietario y Propiedad
                            </Button>
                        )}
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-2">
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/propietarios')}
                        className="me-2"
                    >
                        Cancelar
                    </Button>
                </div>
            </Form>

            <Modal show={showModalComunidad} onHide={() => setShowModalComunidad(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Alta Rápida de Comunidad</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NuevaComunidad
                        onSuccess={() => {
                            refreshComunidades();
                            setShowModalComunidad(false);
                        }}
                        isModal={true}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default NuevoPropietario;