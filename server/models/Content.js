const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['video', 'image', 'article', 'embed'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    contentUrl: {
        type: String,
        required: true
    },
    embedUrl: {
        type: String
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number // 视频时长（秒）
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        avatar: {
            type: String
        }
    },
    source: {
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        iconUrl: {
            type: String
        }
    },
    products: [{
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        }
    }],
    tags: [{
        type: String
    }],
    stats: {
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        }
    },
    isOriginal: {
        type: Boolean,
        default: false
    },
    isExplicit: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 添加索引以提高查询性能
ContentSchema.index({ 'tags': 1 });
ContentSchema.index({ 'author.id': 1 });
ContentSchema.index({ 'createdAt': -1 });
ContentSchema.index({ 'stats.views': -1 });

// 预加载关联的用户数据的方法
ContentSchema.statics.findWithAuthor = function (query) {
    return this.find(query).populate('author.id', 'username avatar');
};

module.exports = mongoose.model('Content', ContentSchema);