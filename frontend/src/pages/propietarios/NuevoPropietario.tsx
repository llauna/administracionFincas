import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PropietarioService } from "../../services/PropietarioService";
import { EmpresaService } from "../../services/EmpresaService";
import { ComunidadService } from "../../services/ComunidadService";
import type { PropietarioDTO } from "../../models/Propietario";
import React from "react";
import {Button} from "react-bootstrap";
import { Modal } from 'react-bootstrap';
import NuevaComunidad from '../comunidades/NuevaComunidad';

const NuevoPropietario = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Omit<PropietarioDTO, '_id'>>({
        nombre: "",
        telefono: "",
        email: "",
        gestorFinca: "",
        comunidades: []
    });
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModalComunidad, setShowModalComunidad] = useState(false);

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
                setLoading(false); // <--- Mover aquí para que siempre se ejecute
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleComunidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedValues = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);

        setFormData(prev => ({
            ...prev,
            comunidades: selectedValues
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Asegurarse de que los datos estén en el formato correcto
            const dataToSend = {
                ...formData,
                gestorFinca: formData.gestorFinca, // Ya debería ser un string
                comunidades: Array.isArray(formData.comunidades)
                    ? formData.comunidades
                    : [formData.comunidades].filter(Boolean)
            };

            console.log('Enviando datos:', dataToSend); // Para depuración

            await PropietarioService.create(dataToSend);
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

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                        type="tel"
                        className="form-control"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Gestor de Finca</label>
                    <select
                        className="form-select"
                        name="gestorFinca"
                        value={formData.gestorFinca}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccionar gestor</option>
                        {empresas.map(empresa => (
                            <option key={empresa._id} value={empresa._id}>
                                {empresa.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Comunidades</label>
                    <Button variant="outline-primary" size="sm" onClick={() => setShowModalComunidad(true)}>
                        + Nueva Comunidad
                    </Button>
                    <select
                        multiple className="form-select"
                        name="comunidades" value={formData.comunidades}
                        onChange={handleComunidadChange}
                    >
                        {comunidades.map(comunidad => (
                            <option key={comunidad._id} value={comunidad._id}>
                                {comunidad.nombre}
                            </option>
                        ))}
                    </select>
                    <div className="form-text">Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples comunidades</div>
                </div>

                {/* MODAL PARA ALTA RÁPIDA DE COMUNIDAD */}
                <Modal show={showModalComunidad} onHide={() => setShowModalComunidad(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Alta Rápida de Comunidad</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Ahora onSuccess ya no dará error de TypeScript */}
                        <NuevaComunidad onSuccess={refreshComunidades} isModal={true} />
                    </Modal.Body>
                </Modal>

                <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" type="submit" className="me-3">
                        Guardar Propietario
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/propietarios')} className="me-2">
                        Volver
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/propietarios')}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NuevoPropietario;