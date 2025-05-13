// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 生成JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 检查必要字段
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // 检查用户是否已存在
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 创建用户
        const user = await User.create({
            username,
            email,
            password,
            avatar: `https://avatars.dicebear.com/api/initials/${username}.svg`
        });

        // 返回用户信息和token
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 检查必要字段
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // 查找用户
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 验证密码
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 返回用户信息和token
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Failed to get user info' });
    }
};
