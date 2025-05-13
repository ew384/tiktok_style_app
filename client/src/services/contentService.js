// client/src/services/contentService.js
import api from './api';

// 获取推荐内容
export const fetchRecommendedContent = async (userId) => {
    const params = userId ? { userId } : {};
    const response = await api.get('/content/recommended', { params });
    return response.data;
};

// 获取内容详情
export const fetchContentById = async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
};

// 获取用户内容
export const fetchUserContent = async (userId) => {
    const response = await api.get(`/content/user/${userId}`);
    return response.data;
};

// 获取标签内容
export const fetchContentByTag = async (tag) => {
    const response = await api.get(`/content/tag/${tag}`);
    return response.data;
};

// 添加新内容
export const addContent = async (contentData) => {
    const response = await api.post('/content', contentData);
    return response.data;
};