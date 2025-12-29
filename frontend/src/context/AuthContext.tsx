// src/context/AuthContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import type {User, UserRole} from '../types/user';

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const hasRole = useCallback((role: UserRole): boolean => {
        if (!user) return false;
        return user.role === role || user.tipo === role;
    }, [user]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser) as User;
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data from localStorage', error);
                localStorage.removeItem('user');
            }
        }

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                try {
                    setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null);
                } catch (error) {
                    console.error('Error parsing user data from storage event', error);
                    setUser(null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = useCallback((userData: User) => {
        const userToStore = {
            _id: userData._id,
            username: userData.username,
            nombreCompleto: userData.nombreCompleto,
            email: userData.email,
            role: userData.role,
            tipo: userData.tipo,
            puesto: userData.puesto,
            departamento: userData.departamento
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
        setUser(userToStore);
    }, []);


    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const value = React.useMemo(() => ({
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole
    }), [user, login, logout, hasRole]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};