// client/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, isLoggedIn, login, logout, register } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                if (isLoggedIn()) {
                    const userData = await getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleLogin = async (email, password) => {
        try {
            setError(null);
            const userData = await login({ email, password });
            setUser(userData);
            return userData;
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            setError(null);
            const newUser = await register(userData);
            setUser(newUser);
            return newUser;
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};