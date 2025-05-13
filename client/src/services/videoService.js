// client/src/services/videoService.js
import api from './api';

/**
 * 从URL提取视频信息
 * @param {string} url - 要提取的视频URL
 * @returns {Promise<Object>} - 视频信息对象，包含url和thumbnail
 */
export const extractVideoUrl = async (url) => {
    const response = await api.post('/video/extract', { url });
    return response.data;
};

/**
 * 批量提取多个视频URL
 * @param {string[]} urls - 视频URL数组
 * @returns {Promise<Array>} - 视频信息数组
 */
export const extractMultipleUrls = async (urls) => {
    const response = await api.post('/video/extract-multiple', { urls });
    return response.data;
};

/**
 * 获取示例视频（用于首页展示）
 * @returns {Promise<Array>} - 视频信息数组
 */
export const getSampleVideos = async () => {
    const response = await api.get('/video/samples');
    return response.data;
};

/**
 * 将视频资源转换为可用的视频对象
 * @param {Object} videoInfo - 提取的视频信息
 * @returns {Object} - 格式化的视频对象
 */
export const formatVideoData = (videoInfo) => {
    // 确保URL存在，否则使用备用视频
    if (!videoInfo.url) {
        console.warn('视频URL不存在，使用备用视频');
        return getDefaultVideo();
    }

    // 处理抖音特定的信息
    const isDouyin = videoInfo.source === 'douyin';
    const username = videoInfo.author || (isDouyin ? '抖音用户' : '视频作者');
    const description = videoInfo.title || '精彩视频内容';

    // 使用视频原始ID（如果存在）或生成一个新ID
    const videoId = videoInfo.id || `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 为描述添加标签
    let enhancedDescription = description;
    if (isDouyin && !description.includes('#')) {
        // 为抖音视频添加一些假标签，增强用户体验
        const tags = ['抖音', '精选', '热门'];
        enhancedDescription = `${description} ${tags.map(tag => `#${tag}`).join(' ')}`;
    }

    // 生成随机统计数据，如果没有提供
    const randomStats = {
        likes: formatStatNumber(Math.floor(Math.random() * 100000)),
        comments: formatStatNumber(Math.floor(Math.random() * 10000)),
        shares: formatStatNumber(Math.floor(Math.random() * 5000))
    };

    return {
        id: videoId,  // 使用原始ID或生成的ID
        url: videoInfo.url,
        poster: videoInfo.thumbnail || '',
        username: username,
        description: enhancedDescription,
        source: videoInfo.source || 'unknown',
        likes: videoInfo.likes || randomStats.likes,
        comments: videoInfo.comments || randomStats.comments,
        shares: videoInfo.shares || randomStats.shares
    };
};

/**
 * 获取默认视频（作为备用）
 */
const getDefaultVideo = () => {
    return {
        id: `default-${Date.now()}`,
        url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
        poster: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
        username: "@视频博主",
        description: "这是一个示例视频 #示例 #视频",
        likes: "1.2万",
        comments: "1345",
        shares: "2.3万",
        source: "demo"
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