// src/pages/usuarios/ListadoUsuarios.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert, Badge, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/UserService';
import { EmpleadoService } from '../../services/EmpleadoService';
import { toast } from 'react-toastify';
import '../../assets/styles/ListadoUsuarios.css'

type UserRole = 'admin' | 'editor' | 'viewer' | 'empleado';

interface Usuario {
    _id?: string;
    username: string;
    email: string;
    role: UserRole;
    nombreCompleto: string;
    telefono?: string;
    fechaContratacion?: string | Date;
    tipo: 'usuario' | 'empleado' | 'propietario';
    isActive?: boolean;
    // Agrega cualquier otra propiedad que puedan tener los empleados
    nombre?: string;
    apellidos?: string;
}
const ListadoUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const navigate = useNavigate();

    const cargarUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Llamamos a un único servicio que ahora nos devuelve todo unificado
            // Asumo que UserService.getAll() ahora apunta al nuevo endpoint del backend
            const todosUsuarios = await UserService.getAll();

            setUsuarios(todosUsuarios.sort((a: Usuario, b: Usuario) =>
                (a.nombreCompleto || '').localeCompare(b.nombreCompleto || '')
            ));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar la lista de usuarios';
            console.error('Error al cargar usuarios:', errorMessage);
            setError(errorMessage);
            toast.error('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const handleEliminarUsuario = async (id: string, tipo: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            return;
        }

        try {
            setDeletingId(id);

            if (tipo === 'empleado') {
                await EmpleadoService.delete(id);
            } else {
                await UserService.delete(id);
            }

            // Actualizar la lista de usuarios
            setUsuarios(prev => prev.filter(u => u._id !== id));
            toast.success('Usuario eliminado correctamente');
        } catch (err: any) {
            console.error('Error al eliminar usuario:', err);
            toast.error(err.message || 'Error al eliminar el usuario');
        } finally {
            setDeletingId(null);
        }
    };

    const getBadgeVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'danger';
            case 'empleado':
                return 'success';
            case 'propietario':
                return 'primary';
            case 'editor':
                return 'warning';
            case 'viewer':
                return 'info';
            default:
                return 'secondary';
        }
    };

    if (loading && usuarios.length === 0) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p>Cargando usuarios...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    {error}
                    <div className="mt-2">
                        <Button variant="outline-danger" size="sm" onClick={cargarUsuarios}>
                            Reintentar
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Listado de Usuarios</h2>
                <div>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/dashboard')}
                        className="me-2"
                    >
                        Volver
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/personal/nuevo')}
                    >
                        Nuevo Usuario
                    </Button>
                </div>
            </div>

            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead className="table-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {usuarios.length > 0 ? (
                        usuarios.map((usuario) => (
                            <tr key={`${usuario.tipo}-${usuario._id}`}>
                                <td>{usuario.nombreCompleto}</td>
                                <td>{usuario.username}</td>
                                <td>{usuario.email}</td>
                                <td>
                                    <Badge bg={getBadgeVariant(usuario.role)}>
                                        {usuario.role}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge bg="info">
                                        {usuario.tipo}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge bg={usuario.isActive === false ? 'secondary' : 'success'}>
                                        {usuario.isActive === false ? 'Inactivo' : 'Activo'}
                                    </Badge>
                                </td>
                                <td className="table-actions">
                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-primary" className="px-3"
                                            onClick={() => {
                                                if (!usuario._id) {
                                                    toast.error('No se puede editar este usuario: ID no válido');
                                                    return;
                                                }
                                                navigate(`/personal/editar/${usuario._id}?tipo=${usuario.tipo}`);
                                            }}

                                            title="Editar"
                                        >
                                            <i className="bi bi-pencil me-1"></i> Editar
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            className="px-3"
                                            onClick={() => handleEliminarUsuario(usuario._id || '', usuario.tipo)}
                                            disabled={deletingId === usuario._id}
                                            title="Eliminar"
                                        >
                                            {deletingId === usuario._id ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-1" /> Eliminando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-trash me-1"></i> Eliminar
                                                </>
                                            )}
                                        </Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center">
                                No se encontraron usuarios
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default ListadoUsuarios;