// server/routes/tiktokRoutes.js
const express = require('express');
const router = express.Router();
const tiktokController = require('../controllers/tiktokController');

// 提取视频真实URL
router.post('/extract', tiktokController.extractVideoUrl);

// 批量提取多个视频URL
router.post('/extract-multiple', tiktokController.extractMultipleUrls);

// 获取示例视频（用于首页展示）
router.get('/samples', tiktokController.getSampleVideos);

module.exports = router;