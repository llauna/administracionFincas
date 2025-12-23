import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type PropietarioDTO } from "../../models/Propietario";
import { PropietarioService } from "../../services/PropietarioService";
import { EmpresaService } from "../../services/EmpresaService";
import { ComunidadService } from "../../services/ComunidadService";
import React from "react";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) {
                    throw new Error("ID no proporcionado");
                }

                const [propietarioData, empresasData, comunidadesData] = await Promise.all([
                    PropietarioService.getById(id),
                    EmpresaService.getAll(),
                    ComunidadService.getAll()
                ]);

                // Asegurarse de que los datos estén en el formato correcto
                const propietarioDTO: PropietarioDTO = {
                    nombre: propietarioData.nombre,
                    telefono: propietarioData.telefono || "",
                    email: propietarioData.email || "",
                    gestorFinca: propietarioData.gestorFinca
                        ? (typeof propietarioData.gestorFinca === 'object'
                            ? propietarioData.gestorFinca._id
                            : propietarioData.gestorFinca)
                        : "",
                    comunidades: Array.isArray(propietarioData.comunidades)
                        ? propietarioData.comunidades
                            .filter(c => c !== null && c !== undefined)
                            .map(c => typeof c === 'object' ? c._id : c)
                        : []
                };

                setFormData(propietarioDTO);
                setEmpresas(empresasData);
                setComunidades(comunidadesData);
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                setError("Error al cargar los datos del propietario");
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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
            if (!id) {
                throw new Error("ID no proporcionado");
            }

            // Asegurarse de que los datos estén en el formato correcto
            const dataToSend: PropietarioDTO = {
                ...formData,
                gestorFinca: formData.gestorFinca,
                comunidades: Array.isArray(formData.comunidades)
                    ? formData.comunidades
                    : [formData.comunidades].filter(Boolean)
            };

            console.log('Actualizando con datos:', dataToSend);
            await PropietarioService.update(id, dataToSend);
            navigate('/propietarios');
        } catch (error) {
            console.error("Error al actualizar propietario:", error);
            setError(`Error al actualizar el propietario: ${(error as Error).message}`);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Cargando...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-3" role="alert">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Editar Propietario</h2>
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
                        value={formData.gestorFinca || ''}
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
                    <select
                        multiple
                        className="form-select"
                        name="comunidades"
                        value={Array.isArray(formData.comunidades) ? formData.comunidades : []}
                        onChange={handleComunidadChange}
                    >
                        {comunidades.map(comunidad => (
                            <option key={comunidad._id} value={comunidad._id}>
                                {comunidad.nombre}
                            </option>
                        ))}
                    </select>
                    <div className="form-text">
                        Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples comunidades
                    </div>
                </div>

                <div className="d-flex justify-content-between">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/propietarios')}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditarPropietario;