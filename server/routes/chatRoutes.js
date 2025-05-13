const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

// 获取内容的消息
router.get('/:contentId', chatController.getMessages);

// 发送消息 (需要认证)
router.post('/:contentId', authenticate, chatController.sendMessage);

// 删除消息 (需要认证)
router.delete('/:messageId', authenticate, chatController.deleteMessage);

module.exports = router;