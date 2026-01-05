import React from 'react';
import { useEffect, useState } from 'react';
import { validarToken } from '../services/auth';

interface Usuario {
    nombreCompleto: string;
    email: string;
    role: string;
}

function Perfil() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        validarToken()
            .then(data => setUsuario(data.user))
            .catch(err => console.error(err.message));
    }, []);

    if (!usuario) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Bienvenido {usuario.nombreCompleto}</h1>
            <p>Email: {usuario.email}</p>
            <p>Rol: {usuario.role}</p>
        </div>
    );
}

export default Perfil;
