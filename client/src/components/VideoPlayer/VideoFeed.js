// client/src/components/VideoPlayer/VideoFeed.js
import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import { getSampleVideos } from '../../services/videoService';
import './VideoPlayer.css';

/**
 * VideoFeed组件
 * 负责管理视频列表、视频滚动和视频切换
 * 
 * @param {Object} props 组件属性
 * @param {Array} props.videos 可选的预加载视频列表
 * @param {boolean} props.autoLoad 是否自动加载视频
 * @param {Function} props.onVideoChange 视频切换回调
 * @returns {JSX.Element} 视频流组件
 */
const VideoFeed = ({
    videos: initialVideos,
    autoLoad = true,
    onVideoChange = () => { }
}) => {
    // 状态管理
    const [videoData, setVideoData] = useState(initialVideos || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const [showTip, setShowTip] = useState(true);

    // Refs
    const containerRef = useRef(null);
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    // 加载视频数据
    useEffect(() => {
        if (initialVideos && initialVideos.length > 0) {
            setVideoData(initialVideos);
            setLoading(false);
            return;
        }

        if (autoLoad) {
            loadVideos();
        }
    }, [initialVideos, autoLoad]);

    // 当前视频变化时通知父组件
    useEffect(() => {
        if (videoData[currentIndex]) {
            onVideoChange(videoData[currentIndex], currentIndex);
        }
    }, [currentIndex, videoData, onVideoChange]);

    // 从API加载视频
    const loadVideos = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('正在加载视频数据...');

            const videos = await getSampleVideos();

            if (videos && videos.length > 0) {
                console.log(`成功加载 ${videos.length} 个视频`);
                setVideoData(videos);
            } else {
                console.log('未获取到视频，使用默认视频');
                setError('无法加载视频，使用示例视频代替');
                setVideoData(getDefaultVideos());
            }
        } catch (err) {
            console.error('加载视频失败:', err);
            setError('加载视频失败，使用示例视频代替');
            setVideoData(getDefaultVideos());
        } finally {
            setLoading(false);
        }
    };

    // 获取默认视频数据（备选方案）
    const getDefaultVideos = () => {
        return [
            {
                id: "default-1",
                url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
                poster: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
                username: "@创作者小明",
                description: "这是一个超级有趣的视频 #热门 #推荐",
                likes: "1.2万",
                comments: "1345",
                shares: "2.3万",
                source: "demo"
            },
            {
                id: "default-2",
                url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
                poster: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
                username: "@旅行达人",
                description: "美丽的风景，你想去吗？ #旅行 #风景",
                likes: "8.7万",
                comments: "5678",
                shares: "1.6万",
                source: "demo"
            }
        ];
    };

    // 加载更多视频
    const loadMoreVideos = async () => {
        if (loading) return;

        try {
            setLoading(true);

            // 这里可以添加分页逻辑，获取下一页视频
            const newVideos = await getSampleVideos();

            if (newVideos && newVideos.length > 0) {
                setVideoData(prev => [...prev, ...newVideos]);
            }
        } catch (err) {
            console.error('加载更多视频失败:', err);
        } finally {
            setLoading(false);
        }
    };

    // 滚动到下一个视频
    const scrollToNextVideo = () => {
        if (currentIndex >= videoData.length - 1 || isScrolling) {
            // 如果是最后一个视频，尝试加载更多
            if (currentIndex >= videoData.length - 2) {
                loadMoreVideos();
            }
            return;
        }

        setIsScrolling(true);
        setCurrentIndex(prevIndex => prevIndex + 1);

        // 滚动完成后重置状态
        setTimeout(() => {
            setIsScrolling(false);
        }, 300);
    };

    // 滚动到上一个视频
    const scrollToPrevVideo = () => {
        if (currentIndex <= 0 || isScrolling) return;

        setIsScrolling(true);
        setCurrentIndex(prevIndex => prevIndex - 1);

        // 滚动完成后重置状态
        setTimeout(() => {
            setIsScrolling(false);
        }, 300);
    };

    // 处理触摸事件
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        e.preventDefault(); // 防止页面滚动
    };

    const handleTouchEnd = (e) => {
        touchEndY.current = e.changedTouches[0].clientY;
        const diffY = touchEndY.current - touchStartY.current;

        // 上滑查看下一个视频
        if (diffY < -50) {
            scrollToNextVideo();
        }
        // 下滑查看上一个视频
        else if (diffY > 50) {
            scrollToPrevVideo();
        }
    };

    // 处理鼠标滚轮事件
    const handleWheel = (e) => {
        e.preventDefault();

        if (e.deltaY > 0) {
            scrollToNextVideo();
        } else {
            scrollToPrevVideo();
        }
    };

    // 设置事件监听器
    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            container.addEventListener('wheel', handleWheel);
            container.addEventListener('touchstart', handleTouchStart);
            container.addEventListener('touchmove', handleTouchMove);
            container.addEventListener('touchend', handleTouchEnd);

            // 防止页面滚动干扰视频滑动
            document.body.style.overflow = 'hidden';

            // 3秒后隐藏提示
            if (showTip) {
                const timer = setTimeout(() => {
                    setShowTip(false);
                }, 3000);

                return () => clearTimeout(timer);
            }
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
                container.removeEventListener('touchstart', handleTouchStart);
                container.removeEventListener('touchmove', handleTouchMove);
                container.removeEventListener('touchend', handleTouchEnd);
            }

            // 恢复页面滚动
            document.body.style.overflow = 'auto';
        };
    }, [showTip]);

    // 处理视频结束事件
    const handleVideoEnd = () => {
        // 自动播放下一个视频
        scrollToNextVideo();
    };

    // 刷新视频列表
    const refreshVideos = () => {
        loadVideos();
        setCurrentIndex(0);
    };

    // 加载中状态
    if (loading && videoData.length === 0) {
        return (
            <div className="video-container loading">
                <div className="loading-spinner"></div>
                <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>加载视频中...</div>
            </div>
        );
    }

    // 错误状态
    if (error && videoData.length === 0) {
        return (
            <div className="video-container error">
                <div style={{ color: 'white', textAlign: 'center' }}>
                    <h3>加载失败</h3>
                    <p>{error}</p>
                    <button onClick={refreshVideos}>重试</button>
                </div>
            </div>
        );
    }

    // 没有视频
    if (videoData.length === 0) {
        return (
            <div className="video-container empty">
                <div style={{ color: 'white', textAlign: 'center' }}>
                    <h3>没有可用的视频</h3>
                    <p>请稍后再试</p>
                    <button onClick={refreshVideos}>重试</button>
                </div>
            </div>
        );
    }

    return (
        <div className="video-container" ref={containerRef}>
            {/* 渲染前一个视频（如果存在） */}
            {currentIndex > 0 && (
                <div className="video-item prev">
                    <VideoPlayer
                        video={videoData[currentIndex - 1]}
                        active={false}
                        autoPlay={false}
                    />
                </div>
            )}

            {/* 渲染当前视频 */}
            <div className="video-item active">
                <VideoPlayer
                    video={videoData[currentIndex]}
                    active={true}
                    autoPlay={true}
                    onVideoEnd={handleVideoEnd}
                    onError={(e) => console.error('当前视频播放错误:', e)}
                />
            </div>

            {/* 渲染下一个视频（如果存在） */}
            {currentIndex < videoData.length - 1 && (
                <div className="video-item next">
                    <VideoPlayer
                        video={videoData[currentIndex + 1]}
                        active={false}
                        autoPlay={false}
                    />
                </div>
            )}

            {/* 提示信息 - 上下滑动切换视频 */}
            {showTip && videoData.length > 1 && (
                <div className="swipe-tip">
                    <div className="tip-text">上下滑动切换视频</div>
                </div>
            )}

            {/* 视频指示器 */}
            <div className="video-indicator">
                {videoData.map((_, index) => (
                    <div
                        key={index}
                        className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                    />
                ))}
            </div>

            {/* 底部导航栏 */}
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
        </div>
    );
};

export default VideoFeed;