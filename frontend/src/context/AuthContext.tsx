// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    _id: string;
    email: string;
    role: string;
    nombreCompleto?: string;
    tipo?: string;
    nombre?: string;
    // añade aquí otros campos que necesites
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
    hasRole: (role: string | string[]) => boolean; // Añadimos esta definición
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Al cargar la app, verificamos si hay sesión guardada
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Error parseando usuario del localStorage", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        // El token ya se guarda en el servicio de auth o en el componente Login
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const hasRole = (role: string | string[]): boolean => {
        if (!user) return false;
        const userRole = user.role || user.tipo || '';
        if (Array.isArray(role)) {
            return role.includes(userRole);
        }
        return userRole === role;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};
