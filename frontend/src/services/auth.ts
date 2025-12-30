// === REGISTRO ===
export async function register(nombreCompleto: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreCompleto, email, password })
    });
    return res.json();
}

// === LOGIN ===
export async function login(email: string, password: string) {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
}

// === VALIDAR TOKEN ===
export async function validarToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token guardado');
    }

    const res = await fetch('/api/auth/validar-token', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Token inválido o error en el servidor');
    }

    return await res.json();
}

// === OBTENER HEADER DE AUTENTICACIÓN ===
export function getAuthHeader(): Record<string, string> {
    const token = getToken();
    if (!token) {
        console.warn('No se encontró token de autenticación');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}

// === OBTENER TOKEN ===
export function getToken() {
    return localStorage.getItem('token');
}

// === LOGOUT ===
export function logout() {
    localStorage.removeItem('token');
}
