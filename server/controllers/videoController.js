// server/controllers/videoController.js
const videoExtractorService = require('../services/pythonVideoExtractorService');

// 提取视频真实URL
exports.extractVideoUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        const videoInfo = await videoExtractorService.getVideoInfo(url);

        if (!videoInfo) {
            return res.status(404).json({ message: 'Failed to extract video URL' });
        }

        res.json(videoInfo);
    } catch (error) {
        console.error('Error extracting video URL:', error);
        res.status(500).json({ message: 'Failed to extract video URL', error: error.message });
    }
};

// 批量提取多个视频URL
exports.extractMultipleUrls = async (req, res) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ message: 'URLs array is required' });
        }

        const results = [];
        for (const url of urls) {
            try {
                const videoInfo = await videoExtractorService.getVideoInfo(url);
                if (videoInfo) {
                    results.push(videoInfo);
                }
            } catch (error) {
                console.error(`Error processing URL ${url}:`, error);
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error extracting multiple video URLs:', error);
        res.status(500).json({ message: 'Failed to extract video URLs', error: error.message });
    }
};

// 获取热门抖音视频示例（用于首页展示）
exports.getSampleVideos = async (req, res) => {
    try {
        // 使用用户提供的中信银行信用卡抖音视频链接
        const sampleVideoUrls = [
            'https://www.douyin.com/discover/search/%E4%B8%AD%E4%BF%A1%E9%93%B6%E8%A1%8C%E4%BF%A1%E7%94%A8%E5%8D%A1?aid=a72dd233-9221-4b77-a0ce-c998d41d8e35&modal_id=7344275866215664911&type=general',
            'https://www.douyin.com/discover/search/%E4%B8%AD%E4%BF%A1%E9%93%B6%E8%A1%8C%E4%BF%A1%E7%94%A8%E5%8D%A1?aid=a72dd233-9221-4b77-a0ce-c998d41d8e35&modal_id=7497182026555002147&type=general',
            'https://www.douyin.com/discover/search/%E4%B8%AD%E4%BF%A1%E9%93%B6%E8%A1%8C%E4%BF%A1%E7%94%A8%E5%8D%A1?aid=a72dd233-9221-4b77-a0ce-c998d41d8e35&modal_id=7491993233560472842&type=general',
            'https://www.douyin.com/discover/search/%E4%B8%AD%E4%BF%A1%E9%93%B6%E8%A1%8C%E4%BF%A1%E7%94%A8%E5%8D%A1?aid=a72dd233-9221-4b77-a0ce-c998d41d8e35&modal_id=7481136540689779987&type=general'
        ];

        console.log("正在提取抖音视频...");

        // 分析和提取视频URL
        const results = [];
        for (const url of sampleVideoUrls) {
            try {
                console.log(`正在处理视频链接: ${url}`);
                const videoInfo = await videoExtractorService.getVideoInfo(url);
                if (videoInfo) {
                    console.log(`成功提取视频信息: ${videoInfo.title}`);
                    results.push(videoInfo);
                }
            } catch (error) {
                console.error(`Error processing sample URL ${url}:`, error);
            }
        }

        console.log(`成功提取 ${results.length} 个视频`);

        if (results.length === 0) {
            // 如果无法获取任何视频，返回默认视频作为备选
            console.log("未能提取任何视频，返回默认视频");
            return res.json(getDefaultVideos());
        }

        res.json(results);
    } catch (error) {
        console.error('Error getting sample videos:', error);
        res.status(500).json({ message: 'Failed to get sample videos', error: error.message });

        // 返回默认视频作为备选
        return res.json(getDefaultVideos());
    }
};

// 默认视频作为备选
function getDefaultVideos() {
    return [
        {
            url: "https://www.douyin.com/video/7499043704997432576",
            thumbnail: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
            title: "View From A Blue Moon",
            author: "Demo User",
            source: "demo"
        },
        {
            url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
            thumbnail: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
            title: "Sample Video 2",
            author: "Demo User",
            source: "demo"
        }
    ];
}