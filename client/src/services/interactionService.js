// client/src/services/interactionService.js
import api from './api';

// 喜欢内容
export const likeContent = async (contentId) => {
    const response = await api.post(`/content/${contentId}/like`);
    return response.data;
};

// 取消喜欢内容
export const unlikeContent = async (contentId) => {
    const response = await api.post(`/content/${contentId}/like`);
    return response.data;
};

// 分享内容
export const shareContent = async (contentId, platform) => {
    const response = await api.post(`/content/${contentId}/share`, { platform });
    return response.data;
};