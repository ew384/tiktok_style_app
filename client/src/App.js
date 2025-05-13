import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import MainFeed from './pages/MainFeed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import { AuthProvider } from './contexts/AuthContext';
import './styles/App.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Layout className="app-container">
                    <Routes>
                        <Route path="/" element={<MainFeed />} />
                        <Route path="/profile/:userId" element={<Profile />} />
                        <Route path="/explore" element={<Explore />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App;