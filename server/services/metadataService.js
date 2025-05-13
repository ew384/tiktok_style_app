const axios = require('axios');
const cheerio = require('cheerio');
const { parse } = require('oembed-parser');

// 从URL获取元数据
exports.fetchMetadata = async (url) => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // 提取基本元数据
        const metadata = {
            title: $('meta[property="og:title"]').attr('content') || $('title').text(),
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
            image: $('meta[property="og:image"]').attr('content'),
            siteName: $('meta[property="og:site_name"]').attr('content') || new URL(url).hostname,
            icon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
        };

        // 如果有相对URL，转换为绝对URL
        if (metadata.icon && !metadata.icon.startsWith('http')) {
            const baseUrl = new URL(url);
            metadata.icon = `${baseUrl.protocol}//${baseUrl.host}${metadata.icon.startsWith('/') ? '' : '/'}${metadata.icon}`;
        }

        // 尝试获取oEmbed信息
        try {
            const oembedData = await parse(url);
            if (oembedData) {
                metadata.embedUrl = oembedData.html;

                // 如果没有找到图片，使用oEmbed的缩略图
                if (!metadata.image && oembedData.thumbnail_url) {
                    metadata.image = oembedData.thumbnail_url;
                }
            }
        } catch (error) {
            // oEmbed可能不可用，忽略错误
        }

        return metadata;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return {
            title: url,
            description: '',
            image: null,
            siteName: new URL(url).hostname,
            icon: null
        };
    }
};

// 从视频URL获取嵌入代码
exports.getVideoEmbed = async (url) => {
    try {
        // 处理YouTube链接
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';

            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                videoId = urlObj.searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1];
            }

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }

        // 处理Vimeo链接
        if (url.includes('vimeo.com')) {
            const vimeoId = url.split('vimeo.com/')[1];
            if (vimeoId) {
                return `https://player.vimeo.com/video/${vimeoId}`;
            }
        }

        // 尝试使用oEmbed获取嵌入代码
        try {
            const oembedData = await parse(url);
            if (oembedData && oembedData.html) {
                // 从HTML中提取src属性
                const match = oembedData.html.match(/src="([^"]+)"/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        } catch (error) {
            // oEmbed可能不可用，忽略错误
        }

        // 无法获取嵌入代码，返回原始URL
        return url;
    } catch (error) {
        console.error('Error getting video embed:', error);
        return url;
    }
};