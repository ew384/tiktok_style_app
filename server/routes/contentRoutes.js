const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate } = require('../middleware/authMiddleware');

// 获取推荐内容
router.get('/recommended', contentController.getRecommendedContent);

// 获取单个内容详情
router.get('/:id', contentController.getContentById);

// 获取用户内容
router.get('/user/:userId', contentController.getUserContent);

// 根据标签获取内容
router.get('/tag/:tag', contentController.getContentByTag);

// 添加新内容 (需要认证)
router.post('/', authenticate, contentController.addContent);

// 喜欢/取消喜欢内容 (需要认证)
router.post('/:id/like', authenticate, contentController.toggleLike);

module.exports = router;