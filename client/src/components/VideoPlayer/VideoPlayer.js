import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videos = [], onVideoChange }) => {
  // 状态变量
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Refs
  const videoContainerRef = useRef(null);
  const activeVideoRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // 使用示例视频数据（如果未提供videos）
  const defaultVideos = [
    {
      id: 1,
      url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
      poster: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
      username: "@创作者小明",
      description: "这是一个超级有趣的视频 #热门 #推荐",
      likes: "1.2万",
      comments: "1345",
      shares: "2.3万"
    },
    {
      id: 2,
      url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
      poster: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
      username: "@旅行达人",
      description: "美丽的风景，你想去吗？ #旅行 #风景",
      likes: "8.7万",
      comments: "5678",
      shares: "1.6万"
    },
    {
      id: 3,
      url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
      poster: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
      username: "@美食博主",
      description: "超简单的美食教程，三分钟学会 #美食 #教程",
      likes: "3.4万",
      comments: "2389",
      shares: "9876"
    }
  ];

  // 使用提供的videos或默认视频
  const videoData = videos.length > 0 ? videos : defaultVideos;

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
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
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

  // 如果没有视频数据
  if (videoData.length === 0) {
    return (
      <div className="video-container empty">
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h3>没有可用的视频</h3>
        </div>
      </div>
    );
  }

  // 渲染视频项
  const renderVideoItem = (video, position) => {
    if (!video) return null;

    const isActive = position === 'active';

    return (
      <div key={video.id} className={`video-item ${position}`} data-video-id={video.id}>
        <div
          className={`video-wrapper ${isActive ? '' : 'paused'}`}
          onClick={(e) => {
            const videoElement = e.currentTarget.querySelector('video');
            toggleVideoPlayback(videoElement, e.currentTarget);
          }}
        >
          <div className="loading-spinner"></div>
          <video
            ref={isActive ? setVideoRef : null}
            src={video.url}
            poster={video.poster}
            playsInline
            webkit-playsinline="true"
            muted={!isActive}
            loop
            preload="auto"
            onCanPlay={(e) => {
              const spinner = e.target.parentNode.querySelector('.loading-spinner');
              if (spinner) {
                spinner.style.display = 'none';
              }
            }}
            onError={(e) => {
              console.error('视频加载失败:', video.url);
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
          <div className="play-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </div>
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
    </div>
  );
};

export default VideoPlayer;