// client/src/app.js 重构版
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import MainFeed from './pages/MainFeed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import { AuthProvider } from './contexts/AuthContext';
import './styles/App.css';

/**
 * 应用主组件
 * 设置路由和全局布局
 */
const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Layout className="app-container">
                    <Routes>
                        <Route path="/" element={<MainFeed />} />
                        <Route path="/profile/:userId" element={<Profile />} />
                        <Route path="/explore" element={<Explore />} />
                        {/* 可以在此处添加更多路由 */}
                        {/* <Route path="/search" element={<SearchResults />} /> */}
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App;