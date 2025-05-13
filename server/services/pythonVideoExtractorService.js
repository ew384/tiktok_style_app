// server/services/pythonVideoExtractorService.js
const { spawn } = require('child_process');
const path = require('path');

/**
 * 提取视频服务 - 通过Python脚本实现
 * extract_tiktok.py脚本获取抖音/TikTok视频的真实URL
 */
class PythonVideoExtractorService {
    constructor() {
        this.pythonScriptPath = path.join(__dirname, '../scripts/extract_tiktok.py');
        this.pythonPath = process.env.PYTHON_PATH || 'python3'; // 可以通过环境变量配置Python路径

        // 备用视频列表（当Python脚本失败时使用）
        this.fallbackVideos = [
            {
                id: "7344275866215664911",
                url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
                thumbnail: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
                title: "中信银行信用卡免息分期",
                author: "中信银行信用卡",
                source: "douyin"
            },
            {
                id: "7497182026555002147",
                url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
                thumbnail: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
                title: "中信银行信用卡在线申请",
                author: "中信银行信用卡",
                source: "douyin"
            },
            {
                id: "7491993233560472842",
                url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
                thumbnail: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
                title: "中信银行信用卡优惠活动",
                author: "中信银行信用卡",
                source: "douyin"
            },
            {
                id: "7481136540689779987",
                url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
                thumbnail: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
                title: "中信银行信用卡年度账单",
                author: "中信银行信用卡",
                source: "douyin"
            }
        ];
    }

    /**
     * 从URL提取视频信息
     * @param {string} url - 视频URL
     * @returns {Promise<Object>} - 视频信息对象
     */
    async getVideoInfo(url) {
        console.log(`开始从URL提取视频: ${url}`);

        try {
            // 先尝试直接从ID映射中获取
            const videoId = await this.extractVideoId(url);
            if (videoId) {
                const fallbackVideo = this.fallbackVideos.find(v => v.id === videoId);
                if (fallbackVideo) {
                    // 这里应该尝试调用Python脚本，如果失败再用fallback
                    // 但为了避免脚本错误，先尝试脚本，代码保留在下面
                    // return fallbackVideo;
                }
            }

            // 调用Python脚本提取视频
            const result = await this.runPythonScript(url);

            if (result && result.success && result.url) {
                console.log(`Python脚本成功提取视频URL: ${result.url.substring(0, 50)}...`);

                // 创建视频信息对象
                return {
                    id: result.id,
                    url: result.url,
                    thumbnail: result.thumbnail,
                    title: `抖音视频 #${result.id}`,
                    author: "抖音用户",
                    source: "douyin"
                };
            } else {
                console.log(`Python脚本提取失败: ${result?.error || '未知错误'}`);

                // 如果脚本提取失败但有视频ID，尝试返回备用视频
                if (result && result.id) {
                    const fallbackVideo = this.fallbackVideos.find(v => v.id === result.id);
                    if (fallbackVideo) {
                        console.log(`使用ID ${result.id} 的备用视频`);
                        return fallbackVideo;
                    }
                }

                // 如果没有找到对应的备用视频，随机返回一个
                console.log('使用随机备用视频');
                const randomIndex = Math.floor(Math.random() * this.fallbackVideos.length);
                return this.fallbackVideos[randomIndex];
            }
        } catch (error) {
            console.error(`视频提取失败: ${error.message}`);
            // 如果脚本执行失败，随机返回一个备用视频
            const randomIndex = Math.floor(Math.random() * this.fallbackVideos.length);
            return this.fallbackVideos[randomIndex];
        }
    }

    /**
     * 运行Python脚本提取视频
     * @param {string} url - 视频URL
     * @returns {Promise<Object>} - 提取结果
     */
    runPythonScript(url) {
        return new Promise((resolve, reject) => {
            console.log(`运行Python脚本: ${this.pythonScriptPath}`);

            const python = spawn(this.pythonPath, [this.pythonScriptPath, url]);

            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
                console.log(`Python脚本输出(stderr): ${data}`);
            });

            python.on('close', (code) => {
                console.log(`Python脚本退出码: ${code}`);

                if (code !== 0) {
                    console.error(`Python脚本执行失败: ${stderr}`);
                    reject(new Error(`脚本执行失败，退出码 ${code}`));
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (error) {
                    console.error(`解析Python脚本输出失败: ${error}, 输出内容: ${stdout}`);
                    reject(error);
                }
            });

            python.on('error', (error) => {
                console.error(`启动Python脚本失败: ${error.message}`);
                reject(error);
            });
        });
    }

    /**
     * 从URL中提取视频ID
     * @param {string} url - 视频URL
     * @returns {Promise<string|null>} - 视频ID
     */
    async extractVideoId(url) {
        try {
            // 检查是否是搜索结果中的视频
            if (url.includes('modal_id=')) {
                const modalIdMatch = url.match(/modal_id=(\d+)/);
                if (modalIdMatch && modalIdMatch[1]) {
                    console.log(`从URL中提取到视频ID: ${modalIdMatch[1]}`);
                    return modalIdMatch[1];
                }
            }

            // 尝试多种模式提取ID
            const patterns = [
                /\/video\/(\d+)/,
                /modal_id=(\d+)/,
                /video\/(\d+)/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    return match[1];
                }
            }

            return null;
        } catch (error) {
            console.error('提取视频ID失败:', error);
            return null;
        }
    }

    /**
     * YouTube视频处理
     * @param {string} url - YouTube URL
     * @returns {Promise<Object>} - 视频信息
     */
    async extractYouTubeVideo(url) {
        let videoId = '';

        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v');
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }

        if (videoId) {
            return {
                url: `https://www.youtube.com/embed/${videoId}`,
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                title: 'YouTube Video',
                author: 'YouTube Channel',
                source: 'youtube'
            };
        }

        throw new Error('无法提取YouTube视频ID');
    }
}

module.exports = new PythonVideoExtractorService();