// client/src/components/VideoPlayer/VideoPlayer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spin } from 'antd';
import './VideoPlayer.css';
import { getSampleVideos, formatVideoData } from '../../services/videoService';

const VideoPlayer = ({ onVideoChange }) => {
  // 状态变量
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [videoData, setVideoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const videoContainerRef = useRef(null);
  const activeVideoRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // 加载TikTok/抖音视频数据
  // 加载TikTok/抖音视频数据
  useEffect(() => {
    const loadRealVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('开始加载抖音视频...');

        // 获取示例视频数据
        const sampleVideos = await getSampleVideos();

        if (sampleVideos && sampleVideos.length > 0) {
          console.log(`成功获取 ${sampleVideos.length} 个抖音视频`);

          // 将提取的视频格式化为所需格式
          const formattedVideos = sampleVideos.map(video => formatVideoData(video));
          setVideoData(formattedVideos);
        } else {
          console.log('未获取到任何抖音视频，使用默认示例视频');
          // 如果无法提取视频，使用默认视频
          setVideoData(getDefaultVideos());
          setError('无法加载抖音视频，使用示例视频代替');
        }
      } catch (err) {
        console.error('加载视频失败:', err);
        setError('无法加载抖音视频，使用示例视频代替');
        setVideoData(getDefaultVideos());
      } finally {
        setLoading(false);
      }
    };

    loadRealVideos();
  }, []);

  // 获取默认视频数据（回退方案）
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

  // 当前视频变化时通知父组件
  useEffect(() => {
    if (onVideoChange && videoData[currentIndex]) {
      onVideoChange(videoData[currentIndex], currentIndex);
    }
  }, [currentIndex, onVideoChange, videoData]);

  // 处理视频播放/暂停
  const toggleVideoPlayback = (videoElement, videoWrapper) => {
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play()
        .then(() => {
          videoWrapper.classList.remove('paused');
        })
        .catch(err => {
          console.error('播放视频失败:', err);
          videoWrapper.classList.add('paused');
        });
    } else {
      videoElement.pause();
      videoWrapper.classList.add('paused');
    }
  };

  // 设置当前视频的引用
  const setVideoRef = useCallback(node => {
    if (node) {
      activeVideoRef.current = node;
      // 尝试自动播放当前视频
      node.play().catch(err => {
        console.log('自动播放被阻止，需要用户交互:', err);
        node.parentNode.classList.add('paused');
      });
    }
  }, []);

  // 处理进度条点击
  const handleProgressClick = (e, videoElement, progressContainer) => {
    e.stopPropagation(); // 防止触发视频播放/暂停

    if (!videoElement || !progressContainer) return;

    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = pos * videoElement.duration;
  };

  // 滚动到下一个视频
  const scrollToNextVideo = () => {
    if (currentIndex >= videoData.length - 1 || isScrolling) return;

    setIsScrolling(true);

    // 暂停当前视频
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
    }

    setCurrentIndex(prevIndex => prevIndex + 1);

    // 滚动完成后
    setTimeout(() => {
      setIsScrolling(false);
    }, 300);
  };

  // 滚动到上一个视频
  const scrollToPrevVideo = () => {
    if (currentIndex <= 0 || isScrolling) return;

    setIsScrolling(true);

    // 暂停当前视频
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
    }

    setCurrentIndex(prevIndex => prevIndex - 1);

    // 滚动完成后
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
    const container = videoContainerRef.current;

    if (container) {
      container.addEventListener('wheel', handleWheel);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);

      // 防止页面滚动干扰视频滑动
      document.body.style.overflow = 'hidden';
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
  }, []);

  // 更新视频进度条
  useEffect(() => {
    // 获取当前激活的视频元素
    const videoElement = activeVideoRef.current;

    if (!videoElement) return;

    // 进度条更新函数
    const updateProgress = () => {
      const progressBar = videoElement.parentNode.querySelector('.progress-bar');
      if (progressBar && videoElement.duration) {
        const percent = (videoElement.currentTime / videoElement.duration) * 100;
        progressBar.style.width = `${percent}%`;
      }
    };

    // 添加事件监听器
    videoElement.addEventListener('timeupdate', updateProgress);

    // 清理函数
    return () => {
      videoElement.removeEventListener('timeupdate', updateProgress);
    };
  }, [currentIndex]);

  // 加载中状态
  if (loading) {
    return (
      <div className="video-container loading">
        <Spin size="large" />
        <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>加载TikTok视频中...</div>
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
          <button onClick={() => window.location.reload()}>重试</button>
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
        </div>
      </div>
    );
  }

  // 渲染视频项
  const renderVideoItem = (video, position) => {
    if (!video) return null;

    const isActive = position === 'active';
    const isYoutube = video.url?.includes('youtube.com/embed') ||
      video.url?.includes('youtu.be') ||
      video.source === 'youtube';
    const isBilibili = video.url?.includes('bilibili.com') ||
      video.source === 'bilibili';
    const isDouyin = video.source === 'douyin';
    const isIframe = isYoutube || isBilibili;

    // 生成唯一的数据id用于调试
    const dataId = `video-${video.id}-${position}`;

    return (
      <div key={video.id} className={`video-item ${position}`} data-video-id={dataId}>
        <div
          className={`video-wrapper ${isActive ? '' : 'paused'}`}
          onClick={(e) => {
            if (!isIframe) {
              const videoElement = e.currentTarget.querySelector('video');
              toggleVideoPlayback(videoElement, e.currentTarget);
            }
          }}
        >
          <div className="loading-spinner"></div>

          {/* 根据视频类型渲染不同的播放器 */}
          {isIframe ? (
            <iframe
              src={video.url}
              title={`Video ${video.id}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            ></iframe>
          ) : (
            <video
              ref={isActive ? setVideoRef : null}
              src={video.url}
              poster={video.poster}
              playsInline
              webkit-playsinline="true"
              muted={!isActive}
              loop
              controls={isActive}
              preload="auto"
              onCanPlay={(e) => {
                const spinner = e.target.parentNode.querySelector('.loading-spinner');
                if (spinner) {
                  spinner.style.display = 'none';
                }

                if (isActive) {
                  // 如果是活动视频且没有设置为暂停状态，尝试播放
                  if (!e.target.paused) return;

                  e.target.play().catch(err => {
                    console.log('自动播放被阻止，需要用户交互:', err);
                    e.target.parentNode.classList.add('paused');
                  });
                }
              }}
              onLoadedData={(e) => {
                console.log(`视频加载完成: ${dataId}`);
                const spinner = e.target.parentNode.querySelector('.loading-spinner');
                if (spinner) {
                  spinner.style.display = 'none';
                }
              }}
              onError={(e) => {
                console.error(`视频加载失败: ${dataId}, URL: ${video.url}`, e);
                const spinner = e.target.parentNode.querySelector('.loading-spinner');
                if (spinner) {
                  spinner.style.display = 'none';
                }
                // 显示错误提示
                const errorMsg = document.createElement('div');
                errorMsg.style = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.7); padding:10px 20px; border-radius:5px; color:white;';
                errorMsg.innerText = '视频加载失败';
                e.target.parentNode.appendChild(errorMsg);
              }}
            >
            </video>
          )}

          {/* 播放按钮 */}
          <div className="play-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>

          {/* 控制条（仅对非iframe视频显示） */}
          {!isIframe && (
            <div className="video-controls">
              <div
                className="progress-bar-container"
                onClick={(e) => {
                  const videoElement = e.currentTarget.parentNode.parentNode.querySelector('video');
                  handleProgressClick(e, videoElement, e.currentTarget);
                }}
              >
                <div className="progress-bar"></div>
              </div>
            </div>
          )}

          {/* 视频信息 */}
          <div className="video-info">
            <h3>{video.username}</h3>
            <p>{video.description}</p>
            {video.source && video.source !== 'unknown' && (
              <div className="video-source">
                来源: {video.source === 'douyin' ? '抖音' : video.source}
              </div>
            )}
          </div>

          {/* 互动按钮 */}
          <div className="video-actions">
            <div className="action-btn">
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              <div className="action-count">{video.likes}</div>
            </div>
            <div className="action-btn">
              <svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" /></svg>
              <div className="action-count">{video.comments}</div>
            </div>
            <div className="action-btn">
              <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" /></svg>
              <div className="action-count">{video.shares}</div>
            </div>
          </div>

          {/* 抖音来源视频标识 */}
          {isDouyin && (
            <div className="douyin-badge">
              <img
                src="https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-whole-c555aa707602e714ec956ac96e9db366.svg"
                alt="抖音"
                width="24"
                height="24"
              />
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="video-container" ref={videoContainerRef}>
      {/* 渲染前一个视频（如果存在） */}
      {currentIndex > 0 && renderVideoItem(videoData[currentIndex - 1], 'prev')}

      {/* 渲染当前视频 */}
      {renderVideoItem(videoData[currentIndex], 'active')}

      {/* 渲染下一个视频（如果存在） */}
      {currentIndex < videoData.length - 1 && renderVideoItem(videoData[currentIndex + 1], 'next')}

      {/* 提示信息 - 上下滑动切换视频 */}
      {videoData.length > 1 && (
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
    </div>
  );
};

export default VideoPlayer;