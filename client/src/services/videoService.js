// client/src/services/videoService.js
// 合并后的视频服务 - 整合了原始videoService.js和tiktokVideoService.js的功能
import api from './api';

/**
 * 从URL提取视频信息
 * @param {string} url - 要提取的视频URL
 * @returns {Promise<Object>} - 视频信息对象，包含url和thumbnail
 */
export const extractVideoUrl = async (url) => {
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
export const extractMultipleUrls = async (urls) => {
    try {
        const response = await api.post('/tiktok/extract-multiple', { urls });
        return response.data;
    } catch (error) {
        console.error('批量提取视频URL失败:', error);
        throw error;
    }
};

/**
 * 获取示例视频（用于首页展示）
 * @returns {Promise<Array>} - 视频信息数组
 */
export const getSampleVideos = async () => {
    try {
        // 使用tiktok API终点获取示例视频
        const response = await api.get('/tiktok/samples');
        return response.data;
    } catch (error) {
        console.error('获取示例视频失败:', error);
        // 返回空数组
        return [];
    }
};

/**
 * 将视频资源转换为可用的视频对象
 * @param {Object} videoInfo - 提取的视频信息
 * @returns {Object} - 格式化的视频对象
 */
export const formatVideoData = (videoInfo) => {
    // 确保URL存在，否则使用备用视频
    if (!videoInfo || !videoInfo.url) {
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
 * @returns {Object} - 默认视频对象
 */
export const getDefaultVideo = () => {
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
 * @param {number} num - 原始数字
 * @returns {string} - 格式化后的数字文本
 */
export const formatStatNumber = (num) => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

/**
 * 处理视频源
 * @param {string} source - 视频来源
 * @returns {string} - 格式化的来源名称
 */
export const formatVideoSource = (source) => {
    const sourceMap = {
        'douyin': '抖音',
        'tiktok': 'TikTok',
        'youtube': 'YouTube',
        'bilibili': 'B站',
        'demo': '示例视频',
        'unknown': '未知来源'
    };

    return sourceMap[source] || source;
};

/**
 * 检查URL是否为某个平台的视频
 * @param {string} url - 视频URL
 * @returns {Object} - 包含平台类型和布尔值的对象
 */
export const checkVideoPlatform = (url) => {
    const platforms = {
        douyin: url.includes('douyin.com') || url.includes('v.douyin.com'),
        tiktok: url.includes('tiktok.com') || url.includes('vm.tiktok.com'),
        youtube: url.includes('youtube.com') || url.includes('youtu.be'),
        bilibili: url.includes('bilibili.com') || url.includes('b23.tv')
    };

    const platform = Object.keys(platforms).find(key => platforms[key]) || 'unknown';
    return { platform, isSupported: platform !== 'unknown' };
};

/**
 * 解析视频URI，处理特殊格式
 * @param {string} uri - 视频URI，可能是ID或URL
 * @returns {string} - 解析后的视频标识符
 */
export const parseVideoUri = (uri) => {
    // 处理不同格式的视频标识符
    if (!uri) return null;

    // 如果是完整URL
    if (uri.startsWith('http')) {
        return uri;
    }

    // 如果是ID格式
    if (/^\d+$/.test(uri)) {
        return `https://www.douyin.com/video/${uri}`;
    }

    // 其他格式，如短代码等
    return uri;
};

/**
 * 增强视频结果，添加额外元数据
 * @param {Object} videoInfo - 基本视频信息
 * @returns {Object} - 增强后的视频信息
 */
export const enhanceVideoMetadata = (videoInfo) => {
    if (!videoInfo) return null;

    // 创建深拷贝，避免修改原对象
    const enhanced = { ...videoInfo };

    // 添加格式化的来源
    enhanced.formattedSource = formatVideoSource(enhanced.source);

    // 添加创建时间（如果没有）
    if (!enhanced.createdAt) {
        enhanced.createdAt = new Date().toISOString();
    }

    // 添加视频时长（如果没有）
    if (!enhanced.duration) {
        // 使用默认时长范围（15-60秒）
        enhanced.duration = Math.floor(Math.random() * 45) + 15;
    }

    // 添加格式化的时长
    enhanced.formattedDuration = formatDuration(enhanced.duration);

    return enhanced;
};

/**
 * 格式化时长为可读字符串
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化的时间（mm:ss格式）
 */
export const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default {
    extractVideoUrl,
    extractMultipleUrls,
    getSampleVideos,
    formatVideoData,
    getDefaultVideo,
    formatStatNumber,
    formatVideoSource,
    checkVideoPlatform,
    parseVideoUri,
    enhanceVideoMetadata,
    formatDuration
};