// server/app.js (更新版)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// 导入路由
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes'); // 旧版视频路由
const tiktokRoutes = require('./routes/tiktokRoutes'); // 新版TikTok路由

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// API路由
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes); // 旧版视频处理路由
app.use('/api/tiktok', tiktokRoutes); // 新版TikTok视频处理路由

// 处理Socket.io连接
require('./services/socketService')(io);

// 提供静态文件(在生产环境中)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };