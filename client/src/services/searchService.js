// client/src/services/searchService.js
import api from './api';

// 搜索内容
export const searchContent = async (query, filters = {}) => {
    const params = { q: query, ...filters };
    const response = await api.get('/search', { params });
    return response.data;
};

// 获取搜索建议
export const getSuggestions = async (query) => {
    const response = await api.get('/search/suggestions', { params: { q: query } });
    return response.data;
};
