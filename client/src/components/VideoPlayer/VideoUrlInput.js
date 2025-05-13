import React, { useState } from 'react';
import { Input, Button, message, Spin } from 'antd';
import styled from 'styled-components';
import { extractVideoUrl, formatVideoData } from '../../services/videoService';

const VideoInputContainer = styled.div`
  margin: 20px;
  padding: 15px;
  background: #202020;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const StyledInput = styled(Input)`
  background: #333;
  color: white;
  border: 1px solid #444;
  
  &::placeholder {
    color: #999;
  }
`;

const StyledButton = styled(Button)`
  margin-left: 10px;
`;

const Title = styled.h3`
  color: white;
  margin-bottom: 15px;
`;

/**
 * 视频URL输入组件
 * 允许用户输入视频URL，提取后添加到播放列表
 */
const VideoUrlInput = ({ onVideoAdd }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    // 处理URL添加
    const handleAddVideo = async () => {
        if (!url.trim()) {
            message.error('请输入有效的视频URL');
            return;
        }

        try {
            setLoading(true);
            const videoInfo = await extractVideoUrl(url.trim());

            if (videoInfo) {
                // 格式化视频数据
                const videoData = formatVideoData(videoInfo);

                // 调用回调函数添加视频
                onVideoAdd(videoData);

                // 清空输入
                setUrl('');
                message.success('视频添加成功!');
            } else {
                message.error('无法提取视频信息');
            }
        } catch (error) {
            console.error('添加视频失败:', error);
            message.error('添加视频失败: ' + (error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <VideoInputContainer>
            <Title>添加视频URL</Title>
            <InputGroup>
                <StyledInput
                    placeholder="粘贴视频URL（YouTube, 抖音, B站等）"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onPressEnter={handleAddVideo}
                    disabled={loading}
                />
                <StyledButton
                    type="primary"
                    onClick={handleAddVideo}
                    disabled={loading}
                >
                    {loading ? <Spin size="small" /> : '添加'}
                </StyledButton>
            </InputGroup>
        </VideoInputContainer>
    );
};

export default VideoUrlInput;