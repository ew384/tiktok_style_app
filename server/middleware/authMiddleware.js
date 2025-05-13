// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
    try {
        // 检查是否有Authorization头
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization token provided' });
        }

        // 提取token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Invalid authorization format' });
        }

        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 确认用户存在
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // 将用户信息添加到请求对象
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        res.status(500).json({ message: 'Authentication failed' });
    }
};