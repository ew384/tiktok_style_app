const mongoose = require('mongoose');
const Content = require('../models/Content');
const User = require('../models/User');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 示例用户
const sampleUsers = [
    {
        username: 'demo_user',
        email: 'demo@example.com',
        password: 'password123',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: '示例用户账号'
    }
];

// 示例内容
const sampleContents = [
    {
        type: 'embed',
        title: '如何制作美味沙拉 | 健康烹饪技巧',
        description: '这个视频展示了如何制作美味又健康的沙拉',
        contentUrl: 'https://www.youtube.com/watch?v=FLd00Bx4tOk',
        embedUrl: 'https://www.youtube.com/embed/FLd00Bx4tOk',
        thumbnailUrl: 'https://img.youtube.com/vi/FLd00Bx4tOk/maxresdefault.jpg',
        source: {
            name: 'YouTube',
            url: 'https://www.youtube.com/watch?v=FLd00Bx4tOk',
            iconUrl: 'https://www.youtube.com/favicon.ico'
        },
        tags: ['烹饪', '健康', '食谱'],
        products: [
            {
                id: 'product1',
                title: '优质橄榄油',
                price: 99.8,
                imageUrl: 'https://via.placeholder.com/150',
                link: 'https://example.com/olive-oil'
            },
            {
                id: 'product2',
                title: '厨房用具套装',
                price: 199,
                imageUrl: 'https://via.placeholder.com/150',
                link: 'https://example.com/kitchen-tools'
            }
        ],
        stats: {
            views: 1205,
            likes: 83,
            shares: 12,
            comments: 7
        }
    },
    {
        type: 'embed',
        title: '5分钟瑜伽教程 | 初学者指南',
        description: '适合初学者的简单瑜伽动作，每天只需5分钟',
        contentUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
        embedUrl: 'https://www.youtube.com/embed/inpok4MKVLM',
        thumbnailUrl: 'https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg',
        source: {
            name: 'YouTube',
            url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
            iconUrl: 'https://www.youtube.com/favicon.ico'
        },
        tags: ['健身', '瑜伽', '初学者'],
        products: [
            {
                id: 'product3',
                title: '瑜伽垫',
                price: 120,
                imageUrl: 'https://via.placeholder.com/150',
                link: 'https://example.com/yoga-mat'
            }
        ],
        stats: {
            views: 3502,
            likes: 287,
            shares: 54,
            comments: 23
        }
    },
    {
        type: 'embed',
        title: '旅行vlog | 探索日本京都的美景',
        description: '跟随我的镜头，探索京都的传统文化和美丽风景',
        contentUrl: 'https://www.youtube.com/watch?v=Jd1wzlwtKJ0',
        embedUrl: 'https://www.youtube.com/embed/Jd1wzlwtKJ0',
        thumbnailUrl: 'https://img.youtube.com/vi/Jd1wzlwtKJ0/maxresdefault.jpg',
        source: {
            name: 'YouTube',
            url: 'https://www.youtube.com/watch?v=Jd1wzlwtKJ0',
            iconUrl: 'https://www.youtube.com/favicon.ico'
        },
        tags: ['旅行', '日本', 'Vlog'],
        products: [
            {
                id: 'product4',
                title: '旅行背包',
                price: 349,
                imageUrl: 'https://via.placeholder.com/150',
                link: 'https://example.com/travel-backpack'
            },
            {
                id: 'product5',
                title: '京都旅游指南',
                price: 58,
                imageUrl: 'https://via.placeholder.com/150',
                link: 'https://example.com/kyoto-guide'
            }
        ],
        stats: {
            views: 8762,
            likes: 723,
            shares: 143,
            comments: 37
        }
    }
];

// 示例消息
const sampleMessages = (userId, contentId) => [
    {
        contentId,
        user: {
            id: userId,
            username: 'demo_user',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        text: '这个视频真的很有用！',
        timestamp: new Date(Date.now() - 3600000)
    },
    {
        contentId,
        user: {
            id: '60f1b0b3b9b1a50015c5f5c5', // 假设的ID
            username: 'jane_doe',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        text: '谢谢分享，我学到了很多！',
        timestamp: new Date(Date.now() - 1800000)
    }
];

// 插入示例数据
async function seedDatabase() {
    try {
        // 清空现有数据
        await User.deleteMany({});
        await Content.deleteMany({});

        // 插入用户
        const createdUsers = await User.create(sampleUsers);
        const userId = createdUsers[0]._id;

        // 为每个内容设置作者
        const contentsWithAuthor = sampleContents.map(content => ({
            ...content,
            author: {
                id: userId,
                username: createdUsers[0].username,
                avatar: createdUsers[0].avatar
            }
        }));

        // 插入内容
        const createdContents = await Content.create(contentsWithAuthor);

        // 插入示例消息
        const Message = mongoose.model('Message');
        await Message.deleteMany({});

        for (const content of createdContents) {
            await Message.create(sampleMessages(userId, content._id));
        }

        console.log('示例数据已成功插入');
        mongoose.connection.close();
    } catch (error) {
        console.error('插入示例数据时出错:', error);
        mongoose.connection.close();
    }
}

seedDatabase();