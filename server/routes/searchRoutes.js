// server/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// 搜索内容
router.get('/', searchController.searchContent);

// 获取搜索建议
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
