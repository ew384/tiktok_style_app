// client/src/services/chatService.js
import api from './api';

// 获取消息
export const fetchMessages = async (contentId) => {
    const response = await api.get(`/chat/${contentId}`);
    return response.data;
};

// 发送消息
export const sendMessage = async (contentId, messageData) => {
    const response = await api.post(`/chat/${contentId}`, messageData);
    return response.data;
};

// 删除消息
export const deleteMessage = async (messageId) => {
    const response = await api.delete(`/chat/${messageId}`);
    return response.data;
};