// src/pages/Propiedades.tsx
import React, { useState, useEffect, type ChangeEvent, type FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/Propiedades.css';
import PropiedadModal from './modals/PropiedadModal';
import type {IPropiedad} from '../models/Propiedad';

interface Propietario {
    _id: string;
    nombre: string;
    apellidos?: string;
}

interface SortConfig {
    key: keyof IPropiedad;
    direction: 'asc' | 'desc';
}

interface PropiedadesProps {
    propietarioId?: string;
}

const Propiedades: React.FC<PropiedadesProps> = ({ propietarioId }) => {
    const navigate = useNavigate();
    const [propiedades, setPropiedades] = useState<IPropiedad[]>([]);
    const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<IPropiedad | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [propietariosDisponibles, setPropietariosDisponibles] = useState<Propietario[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);

    const API_PROPIEDADES_URL = "http://localhost:5000/api/propiedades";
    const API_PROPIETARIOS_URL = "http://localhost:5000/api/propietarios";

    const [formData, setFormData] = useState({
        idPropietario: "",
        direccion: "",
        numero: "",
        poblacion: "",
        cp: "",
        planta: "",
        coeficiente: 0
    });
    const [formError, setFormError] = useState<string>("");

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'direccion', direction: 'asc' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const propiedadesResponse = await axios.get<IPropiedad[]>(API_PROPIEDADES_URL);
                setPropiedades(propiedadesResponse.data);

                const propietariosResponse = await axios.get<Propietario[]>(API_PROPIETARIOS_URL);
                setPropietariosDisponibles(propietariosResponse.data);

                if (propietarioId) {
                    const propiedadResponse = await axios.get<IPropiedad>(`${API_PROPIEDADES_URL}/propietario/${propietarioId}`);
                    setPropiedadSeleccionada(propiedadResponse.data);
                }
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [propietarioId]);

    const handleRefresh = async () => {
        try {
            const propiedadesResponse = await axios.get<IPropiedad[]>(API_PROPIEDADES_URL);
            setPropiedades(propiedadesResponse.data);
        } catch (error) {
            console.error("Error al refrescar propiedades:", error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCrear = async (e: FormEvent) => {
        e.preventDefault();
        setFormError("");

        try {
            await axios.post(API_PROPIEDADES_URL, formData);
            await handleRefresh();
            setShowModal(false);
            setFormData({
                idPropietario: "",
                direccion: "",
                numero: "",
                poblacion: "",
                cp: "",
                planta: "",
                coeficiente: 0
            });
        } catch (error: unknown) {
            console.error("Error al guardar la propiedad:", error);
            const axiosError = error as any;
            const serverError = axiosError?.response?.data?.message || "Error al guardar la propiedad.";
            setFormError(serverError);
        }
    };

    const handleEliminar = async (_id: string) => {
        try {
            await axios.delete(`${API_PROPIEDADES_URL}/${_id}`);
            await handleRefresh();
        } catch (error) {
            console.error('Error al eliminar la propiedad:', error);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const sortedPropiedades = useMemo(() => {
        const { key, direction } = sortConfig;
        return [...propiedades].sort((a, b) => {
            const aValue = (a as any)[key] ?? "";
            const bValue = (b as any)[key] ?? "";
            const aIsNumber = typeof aValue === "number";
            const bIsNumber = typeof bValue === "number";
            if (aIsNumber && bIsNumber) {
                return direction === "asc" ? aValue - bValue : bValue - aValue;
            }
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            if (aStr < bStr) return direction === "asc" ? -1 : 1;
            if (aStr > bStr) return direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [propiedades, sortConfig]);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedPropiedades.length / itemsPerPage);
    }, [sortedPropiedades.length, itemsPerPage]);

    const currentItems = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedPropiedades.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedPropiedades, currentPage, itemsPerPage]);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleSort = (key: keyof IPropiedad) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (loading) {
        return <div className="container mt-4">Cargando...</div>;
    }

    if (propiedadSeleccionada) {
        return (
            <div className="container mt-4">
                <h2>Información de la Propiedad</h2>
                <p><strong>Dirección:</strong> {propiedadSeleccionada.direccion}</p>
                <p><strong>Población:</strong> {propiedadSeleccionada.poblacion}</p>
                <p><strong>CP:</strong> {propiedadSeleccionada.cp}</p>
                <p><strong>Planta:</strong> {propiedadSeleccionada.planta}</p>
                <p><strong>Coeficiente:</strong> {propiedadSeleccionada.coeficiente}</p>
                <button onClick={() => setPropiedadSeleccionada(null)} className="btn btn-secondary mt-3">Volver al listado</button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center">Vista de Propiedades</h1>
            <div className="text-center mb-4">
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Registrar Nueva Propiedad
                </button>
            </div>

            <PropiedadModal
                show={showModal} // controla si el modal está visible
                onClose={() => setShowModal(false)} // cierra el modal
                onSubmit={handleCrear} // función para guardar la propiedad
                onChange={handleChange} // actualiza el formData
                formData={formData} // datos del formulario
                propietarios={propietariosDisponibles} // lista de propietarios
                formError={formError} // mensaje de error si existe
            />


            <h2 className="mt-5">Listado de Propiedades</h2>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th onClick={() => handleSort('idPropietario')} style={{ cursor: 'pointer' }}>
                        Propietario {sortConfig.key === 'idPropietario' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => handleSort('direccion')} style={{ cursor: 'pointer' }}>
                        Dirección {sortConfig.key === 'direccion' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => handleSort('poblacion')} style={{ cursor: 'pointer' }}>
                        Población {sortConfig.key === 'poblacion' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => handleSort('cp')} style={{ cursor: 'pointer' }}>
                        CP {sortConfig.key === 'cp' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => handleSort('planta')} style={{ cursor: 'pointer' }}>
                        Planta {sortConfig.key === 'planta' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                    </th>
                    <th onClick={() => handleSort('coeficiente')} style={{ cursor: 'pointer' }}>
                        Coeficiente {sortConfig.key === 'coeficiente' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                    </th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map(prop => {
                    const propietario = propietariosDisponibles.find(p => p._id === prop.idPropietario.toString());
                    const nombrePropietario = propietario ? `${propietario.nombre} ${propietario.apellidos || ''}` : 'Desconocido';

                    const propId = String(prop._id);
                    return (
                        <tr key={propId}>
                            <td>{nombrePropietario}</td>
                            <td>{prop.direccion}</td>
                            <td>{prop.poblacion}</td>
                            <td>{prop.cp}</td>
                            <td>{prop.planta}</td>
                            <td>{prop.coeficiente}</td>
                            <td>
                                <button className="btn btn-info btn-sm" onClick={() => setPropiedadSeleccionada(prop)}>
                                    Ver Detalles
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(prop._id.toString())}>Eliminar</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <button onClick={handleGoBack} className="btn btn-secondary mt-3">Volver</button>
        </div>
    );
};

export default Propiedades;
