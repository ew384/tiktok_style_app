// server/services/socketService.js (修改版)
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

module.exports = function (io) {
    // 聊天命名空间
    const chatNamespace = io.of('/chat');

    // 中间件验证Socket连接
    chatNamespace.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            const token = socket.handshake.query.token;

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));

                socket.user = decoded;
                next();
            });
        } else {
            // 允许匿名连接，但限制某些功能
            socket.user = null;
            next();
        }
    });

    chatNamespace.on('connection', (socket) => {
        console.log('User connected to chat');

        // 加入特定内容的聊天室
        socket.on('join', ({ contentId }) => {
            if (!contentId) {
                socket.emit('error', { message: 'Content ID is required' });
                return;
            }

            socket.join(contentId.toString());
            console.log(`User joined room: ${contentId}`);
        });

        // 离开聊天室
        socket.on('leave', ({ contentId }) => {
            if (contentId) {
                socket.leave(contentId.toString());
                console.log(`User left room: ${contentId}`);
            }
        });

        // 接收并广播消息
        socket.on('message', async (message) => {
            try {
                if (!message.contentId) {
                    socket.emit('error', { message: 'Content ID is required' });
                    return;
                }

                // 确保contentId是字符串
                const contentId = message.contentId.toString();

                // 如果用户已登录，保存消息到数据库
                if (socket.user) {
                    const newMessage = new Message({
                        contentId: contentId,
                        user: {
                            id: socket.user.id,
                            username: socket.user.username,
                            avatar: socket.user.avatar
                        },
                        text: message.text,
                        replyTo: message.replyTo,
                        attachments: message.attachments || []
                    });

                    await newMessage.save();

                    // 广播保存的消息
                    chatNamespace.to(contentId).emit('message', newMessage);
                } else {
                    // 匿名用户消息直接广播但不保存
                    chatNamespace.to(contentId).emit('message', {
                        contentId: contentId,
                        user: {
                            id: 'anonymous',
                            username: '游客',
                            avatar: 'https://via.placeholder.com/150?text=Guest'
                        },
                        text: message.text,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error broadcasting message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // 断开连接
        socket.on('disconnect', () => {
            console.log('User disconnected from chat');
        });
    });
};