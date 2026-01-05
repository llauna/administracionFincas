import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { UserService } from '../../services/UserService';
import { toast } from 'react-toastify';

const Perfil: React.FC = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    // Estados para datos personales
    const [editMode, setEditMode] = useState(false);
    const [personalData, setPersonalData] = useState({
        nombreCompleto: user?.nombreCompleto || '',
        email: user?.email || '',
        telefono: (user as any)?.telefono || '',
        direccion: (user as any)?.direccion || ''
    });

    // Estados para cambio de contraseña
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Sincronizar datos si el usuario cambia
    useEffect(() => {
        if (user) {
            setPersonalData({
                nombreCompleto: user.nombreCompleto || '',
                email: user.email || '',
                telefono: (user as any).telefono || '',
                direccion: (user as any).direccion || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await UserService.update(user?._id || '', personalData);
            // Actualizamos localmente
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (login) login(updatedUser as any);
            toast.success('Perfil actualizado correctamente');
            setEditMode(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Las contraseñas nuevas no coinciden');
        }
        setLoading(true);
        try {
            await UserService.changePassword(user?._id || '', {
                currentPassword,
                newPassword,
                confirmPassword
            });
            toast.success('Contraseña cambiada con éxito');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Container className="mt-4"><Alert variant="warning">No se ha encontrado información de sesión.</Alert></Container>;
    }

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Mi Perfil</h2>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    Volver
                </Button>
            </div>

            <Row>
                {/* Columna de Datos Personales */}
                <Col lg={7} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
                            <h5 className="mb-0">Datos Personales</h5>
                            {!editMode && (
                                <Button variant="light" size="sm" onClick={() => setEditMode(true)}>
                                    Editar Perfil
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleUpdateProfile}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Nombre Completo</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={personalData.nombreCompleto}
                                                onChange={(e) => setPersonalData({...personalData, nombreCompleto: e.target.value})}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Email</Form.Label>
                                            <Form.Control type="email" value={personalData.email} disabled />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Teléfono</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={personalData.telefono}
                                                onChange={(e) => setPersonalData({...personalData, telefono: e.target.value})}
                                                disabled={!editMode}
                                                placeholder="No asignado"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold">Rol en el sistema</Form.Label>
                                            <div className="pt-1">
                                                <span className="badge bg-info text-dark uppercase">{user.role}</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Dirección</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={personalData.direccion}
                                        onChange={(e) => setPersonalData({...personalData, direccion: e.target.value})}
                                        disabled={!editMode}
                                        placeholder="No asignada"
                                    />
                                </Form.Group>

                                {editMode && (
                                    <div className="d-flex gap-2 border-top pt-3">
                                        <Button type="submit" variant="success" disabled={loading}>
                                            Guardar Cambios
                                        </Button>
                                        <Button variant="outline-secondary" onClick={() => setEditMode(false)}>
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Columna de Cambio de Contraseña */}
                <Col lg={5} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-warning text-dark py-3">
                            <h5 className="mb-0">Seguridad</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handlePasswordChange}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Contraseña Actual</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <hr />
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Confirmar Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-grid mt-4">
                                    <Button type="submit" variant="primary" disabled={loading}>
                                        {loading ? 'Procesando...' : 'Actualizar Contraseña'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Perfil;