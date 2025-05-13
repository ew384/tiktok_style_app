// server/models/Message.js (修改版)
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    contentId: {
        type: String,  // 改为String类型，而不是ObjectId
        required: true
    },
    user: {
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
    text: {
        type: String,
        required: true
    },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'link']
        },
        url: {
            type: String
        }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// 添加索引以提高查询性能
MessageSchema.index({ 'contentId': 1, 'timestamp': -1 });
MessageSchema.index({ 'user.id': 1 });

module.exports = mongoose.model('Message', MessageSchema);