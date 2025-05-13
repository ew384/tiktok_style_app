// server/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// 提取视频真实URL
router.post('/extract', videoController.extractVideoUrl);

// 批量提取多个视频URL
router.post('/extract-multiple', videoController.extractMultipleUrls);

// 获取示例视频（用于首页展示）
router.get('/samples', videoController.getSampleVideos);

module.exports = router;