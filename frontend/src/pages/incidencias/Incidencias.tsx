import React, { useEffect, useState } from 'react';
import { IncidenciaService } from '../../services/IncidenciaService';
import { useAuth } from '../../context/useAuth';
import {Table, Badge, Container, Button, Stack} from 'react-bootstrap';
import {useNavigate} from "react-router-dom";

const Incidencias = () => {
    const [incidencias, setIncidencias] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        cargarIncidencias();
    }, []);

    const cargarIncidencias = async () => {
        try {
            const data = await IncidenciaService.getAll();
            setIncidencias(data);
        } catch (error) {
            console.error("Error cargando incidencias", error);
        }
    };

    const getBadgeBg = (estado: string) => {
        switch (estado) {
            case 'Resuelta': return 'success';
            case 'En Proceso': return 'warning';
            case 'Pendiente': return 'danger';
            case 'Cerrada': return 'dark';
            default: return 'secondary';
        }
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Gestión de Incidencias</h2>
                    <p className="text-muted">
                        Bienvenido, {user?.nombreCompleto || user?.email}.
                        Aquí puedes ver las incidencias {user?.role === 'admin' || user?.role === 'empleado' ? 'globales' : 'de tu comunidad'}.
                    </p>
                </div>
                <Stack direction="horizontal" gap={2}>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        Volver
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/incidencias/nueva')}>
                        Nueva Incidencia
                    </Button>
                </Stack>
            </div>

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                <tr>
                    <th>Título</th>
                    <th>Comunidad</th>
                    <th>Estado</th>
                    <th>Gravedad</th>
                    <th>Fecha Reporte</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {incidencias.length > 0 ? (
                    incidencias.map((inc: any) => (
                        <tr key={inc._id}>
                            <td>{inc.titulo}</td>
                            <td>{inc.comunidad?.nombre || 'General'}</td>
                            <td>
                                <Badge bg={getBadgeBg(inc.estado)}>{inc.estado}</Badge>
                            </td>
                            <td>
                                    <span className={`text-${inc.gravedadImpacto === 'Crítica' || inc.gravedadImpacto === 'Alta' ? 'danger' : 'body'}`}>
                                        {inc.gravedadImpacto}
                                    </span>
                            </td>
                            <td>{new Date(inc.fechaHoraReporte).toLocaleDateString()}</td>
                            <td>
                                <Button variant="link" onClick={() => navigate(`/incidencias/${inc._id}`)}>
                                    {inc.titulo}
                                </Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-4">No hay incidencias registradas</td>
                    </tr>
                )}
                </tbody>
            </Table>
        </Container>
    );
};

export default Incidencias;