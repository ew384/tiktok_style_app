const Message = require('../models/Message');

// 获取内容的消息
exports.getMessages = async (req, res) => {
    try {
        const { contentId } = req.params;

        const messages = await Message.find({ contentId })
            .sort({ timestamp: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Failed to get messages' });
    }
};

// 发送消息
exports.sendMessage = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { text, replyTo, attachments } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Message text is required' });
        }

        const newMessage = new Message({
            contentId,
            user: {
                id: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar
            },
            text,
            replyTo,
            attachments: attachments || []
        });

        const savedMessage = await newMessage.save();

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// 删除消息
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // 验证用户是否有权限删除消息
        if (message.user.id.toString() !== userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await message.remove();

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};