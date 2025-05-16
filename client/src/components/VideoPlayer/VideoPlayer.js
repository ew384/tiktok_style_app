// client/src/components/VideoPlayer/VideoPlayer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spin } from 'antd';
import './VideoPlayer.css';

/**
 * VideoPlayer组件
 * 负责单个视频的播放、控制和交互
 * 
 * @param {Object} props 组件属性
 * @param {Object} props.video 要播放的视频对象
 * @param {boolean} props.autoPlay 是否自动播放
 * @param {boolean} props.active 是否处于激活状态
 * @param {Function} props.onVideoEnd 视频结束回调
 * @param {Function} props.onError 错误处理回调
 * @param {Function} props.onPlay 播放事件回调
 * @param {Function} props.onPause 暂停事件回调
 * @returns {JSX.Element} 视频播放器组件
 */
const VideoPlayer = ({
  video,
  autoPlay = true,
  active = true,
  onVideoEnd = () => { },
  onError = () => { },
  onPlay = () => { },
  onPause = () => { }
}) => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);

  // Refs
  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);

  // 处理视频平台类型
  const isYoutube = video?.url?.includes('youtube.com/embed') ||
    video?.url?.includes('youtu.be') ||
    video?.source === 'youtube';

  const isBilibili = video?.url?.includes('bilibili.com') ||
    video?.source === 'bilibili';

  const isDouyin = video?.source === 'douyin';
  const isIframe = isYoutube || isBilibili;

  // 初始化视频
  useEffect(() => {
    if (!video) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    if (autoPlay && active && videoRef.current && !isIframe) {
      videoRef.current.load();
    }
  }, [video, autoPlay, active, isIframe]);

  // 自动播放处理
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isIframe || !active) return;

    if (autoPlay) {
      videoElement.play()
        .then(() => {
          setPlaying(true);
          onPlay();
        })
        .catch(err => {
          console.error('自动播放被阻止:', err);
          setPlaying(false);
          onPause();
        });
    }

    return () => {
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
        setPlaying(false);
      }
    };
  }, [autoPlay, active, isIframe, onPlay, onPause]);

  // 激活状态变化处理
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isIframe) return;

    if (active) {
      if (playing) {
        videoElement.play()
          .then(() => onPlay())
          .catch(err => console.error('播放失败:', err));
      }
    } else {
      videoElement.pause();
      onPause();
    }
  }, [active, playing, isIframe, onPlay, onPause]);

  // 更新进度条
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isIframe) return;

    const updateProgress = () => {
      if (videoElement.duration) {
        const percent = (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(percent);
      }
    };

    const handleEnded = () => {
      setPlaying(false);
      onVideoEnd();
    };

    videoElement.addEventListener('timeupdate', updateProgress);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', updateProgress);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [isIframe, onVideoEnd]);

  // 播放/暂停切换
  const togglePlayback = useCallback(() => {
    if (isIframe) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play()
        .then(() => {
          setPlaying(true);
          onPlay();
        })
        .catch(err => {
          console.error('播放失败:', err);
          setPlaying(false);
        });
    } else {
      videoElement.pause();
      setPlaying(false);
      onPause();
    }
  }, [isIframe, onPlay, onPause]);

  // 进度条点击处理
  const handleProgressClick = (e) => {
    if (isIframe) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = pos * videoElement.duration;
  };

  // 音量调整
  const handleVolumeChange = (value) => {
    if (isIframe) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.volume = value;
    setVolume(value);
  };

  // 错误处理函数
  const handleError = (e) => {
    console.error('视频加载失败:', e);
    setError('视频加载出错，请稍后再试');
    setLoading(false);
    onError(e);
  };

  // 加载处理函数
  const handleVideoLoaded = () => {
    setLoading(false);

    // 获取持续时间
    const duration = videoRef.current?.duration;
    if (duration && typeof onVideoLoaded === 'function') {
      onVideoLoaded({ duration });
    }
  };

  // 如果没有视频数据
  if (!video) {
    return (
      <div className="video-wrapper empty">
        <div className="video-placeholder">暂无视频</div>
      </div>
    );
  }

  // 渲染视频播放器
  return (
    <div
      className={`video-wrapper ${playing ? '' : 'paused'} ${loading ? 'loading' : ''}`}
      ref={videoWrapperRef}
      onClick={togglePlayback}
      data-video-id={video.id}
    >
      {/* 加载指示器 */}
      {loading && (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      )}

      {/* 视频元素 */}
      {isIframe ? (
        <iframe
          src={video.url}
          title={video.title || `Video ${video.id}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={handleError}
        />
      ) : (
        <video
          ref={videoRef}
          src={video.url}
          poster={video.poster}
          playsInline
          webkit-playsinline="true"
          muted={volume === 0}
          loop={false}
          controls={false}
          preload="auto"
          onCanPlay={handleVideoLoaded}
          onLoadedData={handleVideoLoaded}
          onError={handleError}
        />
      )}

      {/* 播放按钮 */}
      {!playing && (
        <div className="play-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        </div>
      )}

      {/* 视频控制区 */}
      {!isIframe && (
        <div className="video-controls" onClick={e => e.stopPropagation()}>
          <div
            className="progress-bar-container"
            onClick={handleProgressClick}
          >
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="control-buttons">
            <button className="control-button" onClick={togglePlayback}>
              {playing ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              )}
            </button>

            <div className="volume-control">
              <button className="control-button" onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}>
                {volume > 0 ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 视频信息覆盖层 */}
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

      {/* 错误信息 */}
      {error && (
        <div className="video-error">
          <div className="error-message">{error}</div>
        </div>
      )}

      {/* 抖音标记 */}
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
  );
};

export default VideoPlayer;