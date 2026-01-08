// NuevaComunidad.tsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ComunidadService } from '../../services/ComunidadService';
import { PropiedadGenerator } from '../../services/PropiedadGenerator';

interface NuevaComunidadProps {
    onSuccess?: () => void;
    isModal?: boolean;
}

const NuevaComunidad: React.FC<NuevaComunidadProps> = ({ onSuccess, isModal = false }) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('datos-generales');
    const [formData, setFormData] = useState({
        // Datos generales
        nombre: '',
        direccion: '',
        codigoPostal: '',
        ciudad: '',
        pais: 'España',
        // Configuración de la propiedad
        numPisos: 0,
        pisosPorBloque: 1,
        tieneLocales: false,
        localesPorPlanta: 0,
        tieneParking: false,
        plazasParking: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) :
                type === 'checkbox' ? checked :
                    value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Crear la comunidad
            const comunidad = await ComunidadService.create({
                nombre: formData.nombre,
                direccion: formData.direccion,
                codigoPostal: formData.codigoPostal,
                ciudad: formData.ciudad,
                pais: formData.pais,
                numPisos: formData.numPisos,
                pisosPorBloque: formData.pisosPorBloque,
                tieneLocales: formData.tieneLocales,
                localesPorPlanta: formData.localesPorPlanta,
                tieneParking: formData.tieneParking,
                plazasParking: formData.plazasParking
            });

            // 2. Generar propiedades automáticamente
            if (comunidad._id) {
                await PropiedadGenerator.generateForCommunity({
                    direccion: formData.direccion,
                    numPisos: formData.numPisos,
                    pisosPorBloque: formData.pisosPorBloque,
                    tieneLocales: formData.tieneLocales,
                    localesPorPlanta: formData.localesPorPlanta,
                    tieneParking: formData.tieneParking,
                    plazasParking: formData.plazasParking,
                    comunidadId: comunidad._id
                });
            }

            if (isModal && onSuccess) {
                onSuccess();
            } else {
                navigate('/comunidades');
            }
        } catch (err) {
            setError('Error al crear la comunidad: ' + (err as Error).message);
            console.error(err);
        }
    };

    return (
        <Container className={isModal ? "" : "mt-4"}>
            {!isModal && <h2>Nueva Comunidad</h2>}

            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k || 'datos-generales')}
                            className="mb-3"
                        >
                            {/* Pestaña de Datos Generales */}
                            <Tab eventKey="datos-generales" title="Datos Generales">
                                <Row className="mb-3">
                                    <Form.Group as={Col} md={6} className="mb-3">
                                        <Form.Label>Nombre de la Comunidad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} md={6} className="mb-3">
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Row>

                                <Row>
                                    <Form.Group as={Col} md={4} className="mb-3">
                                        <Form.Label>Código Postal</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="codigoPostal"
                                            value={formData.codigoPostal}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} md={4} className="mb-3">
                                        <Form.Label>Ciudad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ciudad"
                                            value={formData.ciudad}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} md={4} className="mb-3">
                                        <Form.Label>País</Form.Label>
                                        <Form.Select
                                            name="pais"
                                            value={formData.pais}
                                            onChange={handleChange}
                                        >
                                            <option value="España">España</option>
                                            <option value="Portugal">Portugal</option>
                                            <option value="Francia">Francia</option>
                                            <option value="Andorra">Andorra</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Row>
                            </Tab>

                            {/* Pestaña de Configuración de la Propiedad */}
                            <Tab eventKey="configuracion" title="Configuración de la Propiedad">
                                <Row className="mb-3">
                                    <Form.Group as={Col} md={6}>
                                        <Form.Label>Número de Plantas</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            name="numPisos"
                                            value={formData.numPisos}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} md={6}>
                                        <Form.Label>Viviendas por Planta</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            name="pisosPorBloque"
                                            value={formData.pisosPorBloque}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        id="tieneLocales"
                                        label="Incluir locales comerciales"
                                        name="tieneLocales"
                                        checked={formData.tieneLocales}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                {formData.tieneLocales && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Número de locales</Form.Label>
                                        <Form.Control type="number" min="0"
                                            name="localesPorPlanta" value={formData.localesPorPlanta}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group>
                                    <Form.Check
                                        type="checkbox"
                                        id="tieneParking"
                                        label="Incluir plazas de parking"
                                        name="tieneParking"
                                        checked={formData.tieneParking}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                {formData.tieneParking && (
                                    <Form.Group className="mt-3">
                                        <Form.Label>Número de plazas de parking</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            name="plazasParking"
                                            value={formData.plazasParking}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                )}
                            </Tab>
                        </Tabs>

                        <div className="d-flex justify-content-between mt-4">
                            <div>
                                {activeTab === 'configuracion' && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setActiveTab('datos-generales')}
                                    >
                                        Anterior
                                    </Button>
                                )}
                            </div>

                            <div>
                                {activeTab === 'datos-generales' ? (
                                    <Button
                                        variant="primary"
                                        onClick={() => setActiveTab('configuracion')}
                                    >
                                        Siguiente
                                    </Button>
                                ) : (
                                    <Button variant="primary" type="submit">
                                        Crear Comunidad
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default NuevaComunidad;