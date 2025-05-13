// server/controllers/searchController.js
const Content = require('../models/Content');
const User = require('../models/User');

// 搜索内容
exports.searchContent = async (req, res) => {
    try {
        const { q, type, tag } = req.query;
        let query = {};

        // 基于查询字符串搜索
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ];
        }

        // 按内容类型过滤
        if (type) {
            query.type = type;
        }

        // 按标签过滤
        if (tag) {
            query.tags = tag;
        }

        const contents = await Content.find(query)
            .sort({ 'stats.views': -1 })
            .limit(20);

        res.json(contents);
    } catch (error) {
        console.error('Search content error:', error);
        res.status(500).json({ message: 'Failed to search content' });
    }
};

// 获取搜索建议
exports.getSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json([]);
        }

        // 内容标题建议
        const contentSuggestions = await Content.find({
            title: { $regex: q, $options: 'i' }
        })
            .limit(5)
            .select('title');

        // 标签建议
        const tagSuggestions = await Content.aggregate([
            { $unwind: '$tags' },
            { $match: { tags: { $regex: q, $options: 'i' } } },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 用户名建议
        const userSuggestions = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .limit(5)
            .select('username');

        // 组合所有建议
        const suggestions = [
            ...contentSuggestions.map(content => ({
                type: 'content',
                text: content.title
            })),
            ...tagSuggestions.map(tag => ({
                type: 'tag',
                text: `#${tag._id}`
            })),
            ...userSuggestions.map(user => ({
                type: 'user',
                text: `@${user.username}`
            }))
        ];

        // 按类型排序并限制总数
        res.json(suggestions.slice(0, 10));
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ message: 'Failed to get suggestions' });
    }
};
