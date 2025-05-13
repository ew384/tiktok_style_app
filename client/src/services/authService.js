// client/src/services/authService.js
import api from './api';

// 用户注册
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

// 用户登录
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

// 退出登录
export const logout = () => {
    localStorage.removeItem('token');
};

// 获取当前用户
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// 检查是否已登录
export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
};
