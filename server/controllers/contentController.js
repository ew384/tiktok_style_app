const Content = require('../models/Content');
const User = require('../models/User');
const { fetchMetadata } = require('../services/metadataService');

// 获取推荐内容
exports.getRecommendedContent = async (req, res) => {
    try {
        const userId = req.query.userId;
        let query = {};

        // 如果指定了用户ID，获取基于用户兴趣的内容
        if (userId) {
            const user = await User.findById(userId);
            if (user && user.interests && user.interests.length > 0) {
                query.tags = { $in: user.interests };
            }
        }

        // 获取内容并按观看次数和创建时间排序
        const contents = await Content.find(query)
            .sort({ 'stats.views': -1, createdAt: -1 })
            .limit(20);

        res.json(contents);
    } catch (error) {
        console.error('Error getting recommended content:', error);
        res.status(500).json({ message: 'Failed to get recommended content' });
    }
};

// 获取某个用户的内容
exports.getUserContent = async (req, res) => {
    try {
        const { userId } = req.params;
        const contents = await Content.find({ 'author.id': userId })
            .sort({ createdAt: -1 });

        res.json(contents);
    } catch (error) {
        console.error('Error getting user content:', error);
        res.status(500).json({ message: 'Failed to get user content' });
    }
};

// 获取单个内容详情
exports.getContentById = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findById(id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // 增加浏览量
        content.stats.views += 1;
        await content.save();

        res.json(content);
    } catch (error) {
        console.error('Error getting content by id:', error);
        res.status(500).json({ message: 'Failed to get content' });
    }
};

// 添加新内容
exports.addContent = async (req, res) => {
    try {
        const { type, title, description, contentUrl, tags, isOriginal, sourceUrl } = req.body;

        // 验证必要字段
        if (!type || !title || !contentUrl) {
            return res.status(400).json({ message: 'Type, title and contentUrl are required' });
        }

        // 检查是否为合法的内容类型
        if (!['video', 'image', 'article', 'embed'].includes(type)) {
            return res.status(400).json({ message: 'Invalid content type' });
        }

        // 如果是非原创内容，需要提供源URL
        if (!isOriginal && !sourceUrl) {
            return res.status(400).json({ message: 'Source URL is required for non-original content' });
        }

        // 如果是非原创内容，获取源网站的元数据
        let source = null;
        let thumbnailUrl = req.body.thumbnailUrl;
        let embedUrl = null;

        if (!isOriginal && sourceUrl) {
            const metadata = await fetchMetadata(sourceUrl);

            source = {
                name: metadata.siteName || new URL(sourceUrl).hostname,
                url: sourceUrl,
                iconUrl: metadata.icon
            };

            // 如果没有提供缩略图，使用源网站的缩略图
            if (!thumbnailUrl && metadata.image) {
                thumbnailUrl = metadata.image;
            }

            // 如果是嵌入类型，提取嵌入URL
            if (type === 'embed' && metadata.embedUrl) {
                embedUrl = metadata.embedUrl;
            }
        }

        // 创建新内容
        const newContent = new Content({
            type,
            title,
            description: description || '',
            contentUrl,
            embedUrl,
            thumbnailUrl: thumbnailUrl || 'https://via.placeholder.com/640x360?text=No+Thumbnail',
            author: {
                id: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar
            },
            source: source || {
                name: 'Original Content',
                url: contentUrl,
                iconUrl: req.user.avatar
            },
            tags: tags || [],
            isOriginal: isOriginal || false
        });

        await newContent.save();
        res.status(201).json(newContent);
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).json({ message: 'Failed to add content' });
    }
};

// 喜欢/取消喜欢内容
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const content = await Content.findById(id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 检查是否已经喜欢过
        const likedIndex = user.likedContent.indexOf(id);

        if (likedIndex === -1) {
            // 添加喜欢
            user.likedContent.push(id);
            content.stats.likes += 1;

            await user.save();
            await content.save();

            return res.json({ liked: true, likes: content.stats.likes });
        } else {
            // 取消喜欢
            user.likedContent.splice(likedIndex, 1);
            content.stats.likes = Math.max(0, content.stats.likes - 1);

            await user.save();
            await content.save();

            return res.json({ liked: false, likes: content.stats.likes });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Failed to toggle like' });
    }
};

// 通过标签获取内容
exports.getContentByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const contents = await Content.find({ tags: tag })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(contents);
    } catch (error) {
        console.error('Error getting content by tag:', error);
        res.status(500).json({ message: 'Failed to get content by tag' });
    }
};