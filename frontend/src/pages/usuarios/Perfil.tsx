import React, { useState } from 'react';
import { Container, Card, Button, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { UserService } from '../../services/UserService';
import { toast } from 'react-toastify';

const Perfil: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
            {/* ESTE BLOQUE ES EL QUE FALTA O ESTÁ MAL COLOCADO */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Mi Perfil</h2>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    Volver
                </Button>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-primary text-white">Datos de Usuario</Card.Header>
                        <Card.Body>
                            <p><strong>Nombre:</strong> {user?.nombreCompleto}</p>
                            <p><strong>Email:</strong> {user?.email}</p>
                            <p><strong>Rol:</strong> <span className="badge bg-info">{user?.role}</span></p>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-6">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-warning text-dark">Seguridad - Cambiar Contraseña</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handlePasswordChange}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contraseña Actual</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Cambiando...' : 'Actualizar Contraseña'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    );
};

export default Perfil;