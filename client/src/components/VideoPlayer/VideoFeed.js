// client/src/components/VideoPlayer/VideoFeed.js
import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import './VideoPlayer.css';

const VideoFeed = () => {
    const [currentVideo, setCurrentVideo] = useState(null);

    // 组件加载后打印调试信息
    useEffect(() => {
        console.log('VideoFeed 组件已加载，准备获取抖音视频...');

        // 打印用户代理信息，有助于调试
        console.log('用户代理: ', navigator.userAgent);
    }, []);

    // 处理视频切换
    const handleVideoChange = (video, index) => {
        setCurrentVideo(video);
        console.log(`切换到视频 ${index + 1}:`);
        console.log('- 标题:', video.description);
        console.log('- 作者:', video.username);
        console.log('- 来源:', video.source);
    };

    return (
        <>
            {/* 使用VideoPlayer组件，不传入videos参数，让它自己获取TikTok视频 */}
            <VideoPlayer onVideoChange={handleVideoChange} />

            <div className="bottom-nav">
                <div className="nav-item active">
                    <div className="nav-icon">🏠</div>
                    <span>首页</span>
                </div>
                <div className="nav-item">
                    <div className="nav-icon">🔍</div>
                    <span>发现</span>
                </div>
                <div className="nav-item">
                    <div className="nav-icon">➕</div>
                    <span>添加</span>
                </div>
                <div className="nav-item">
                    <div className="nav-icon">💬</div>
                    <span>消息</span>
                </div>
                <div className="nav-item">
                    <div className="nav-icon">👤</div>
                    <span>我</span>
                </div>
            </div>
        </>
    );
};

export default VideoFeed;