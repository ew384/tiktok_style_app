// client/src/services/tiktokVideoService.js
import api from './api';

/**
 * 获取示例抖音视频（用于首页展示）
 * @returns {Promise<Array>} - 视频信息数组
 */
export const getSampleTiktokVideos = async () => {
    try {
        // 使用新的TikTok API终点
        const response = await api.get('/tiktok/samples');
        return response.data;
    } catch (error) {
        console.error('获取示例视频失败:', error);
        // 返回空数组
        return [];
    }
};

/**
 * 从URL提取视频信息
 * @param {string} url - 要提取的视频URL
 * @returns {Promise<Object>} - 视频信息对象，包含url和thumbnail
 */
export const extractTiktokUrl = async (url) => {
    try {
        const response = await api.post('/tiktok/extract', { url });
        return response.data;
    } catch (error) {
        console.error('提取视频URL失败:', error);
        throw error;
    }
};

/**
 * 批量提取多个视频URL
 * @param {string[]} urls - 视频URL数组
 * @returns {Promise<Array>} - 视频信息数组
 */
export const extractMultipleTiktokUrls = async (urls) => {
    try {
        const response = await api.post('/tiktok/extract-multiple', { urls });
        return response.data;
    } catch (error) {
        console.error('批量提取视频URL失败:', error);
        throw error;
    }
};

/**
 * 将视频资源转换为可用的视频对象
 * @param {Object} videoInfo - 提取的视频信息
 * @returns {Object} - 格式化的视频对象
 */
export const formatTiktokVideoData = (videoInfo) => {
    // 确保必需的字段存在
    return {
        id: videoInfo.id || `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: videoInfo.url,
        poster: videoInfo.thumbnail || '',
        username: videoInfo.author || '抖音用户',
        description: videoInfo.title || '抖音视频',
        source: videoInfo.source || 'douyin',
        likes: videoInfo.likes || formatStatNumber(Math.floor(Math.random() * 100000)),
        comments: videoInfo.comments || formatStatNumber(Math.floor(Math.random() * 10000)),
        shares: videoInfo.shares || formatStatNumber(Math.floor(Math.random() * 5000))
    };
};

/**
 * 格式化统计数字（如点赞数）
 */
const formatStatNumber = (num) => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};