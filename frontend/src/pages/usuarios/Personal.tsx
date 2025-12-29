import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { EmpleadoService } from '../../services/EmpleadoService';
import { LinkContainer } from 'react-router-bootstrap';

const Personal: React.FC = () => {
    const navigate = useNavigate();
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmpleados = async () => {
        try {
            setLoading(true);
            const data = await EmpleadoService.getAll();
            setEmpleados(data);
        } catch (err) {
            setError('Error al cargar la lista de empleados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpleados();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar a este empleado?')) {
            try {
                await EmpleadoService.delete(id);
                fetchEmpleados();
            } catch (err) {
                setError('Error al eliminar el empleado');
            }
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Listado de Personal</h2>
                <div>
                    <LinkContainer to="/personal/nuevo">
                        <Button variant="success" className="me-2">Nuevo Empleado</Button>
                    </LinkContainer>
                    <Button variant="secondary" onClick={() => navigate('/gestion-usuarios')}>Volver</Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Puesto</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {empleados.map((emp) => (
                    <tr key={emp._id}>
                        <td>{emp.nombre}</td>
                        <td>{emp.dni}</td>
                        <td>{emp.puesto}</td>
                        <td>{emp.email}</td>
                        <td>
                            <LinkContainer to={`/personal/editar/${emp._id}`}>
                                <Button variant="info" size="sm" className="me-2">Editar</Button>
                            </LinkContainer>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(emp._id)}>
                                Eliminar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default Personal;
