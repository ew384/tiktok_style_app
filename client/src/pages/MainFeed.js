// client/src/pages/MainFeed.js
import React, { useState } from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';
import SearchBar from '../components/SearchBar';
import ChatSection from '../components/ChatSection';
import ActionPanel from '../components/ActionPanel';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';

const { Header, Sider, Content } = Layout;

const StyledLayout = styled(Layout)`
  height: 100vh;
  background: #121212;
`;

const StyledHeader = styled(Header)`
  background: #202020;
  padding: 0 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const LeftSider = styled(Sider)`
  background: #202020;
  overflow: auto;
`;

const RightSider = styled(Sider)`
  background: #202020;
`;

const MainContent = styled(Content)`
  background: #121212;
  position: relative;
`;

const MainFeed = () => {
  const [currentVideo, setCurrentVideo] = useState(null);

  // 视频切换时的回调函数
  const handleVideoChange = (video, index) => {
    setCurrentVideo(video);
  };

  return (
    <StyledLayout>
      <StyledHeader>
        <SearchBar />
      </StyledHeader>
      <Layout>
        <LeftSider width={300}>
          <ChatSection contentId={currentVideo?.id} />
        </LeftSider>
        <MainContent>
          {/* 这里使用VideoPlayer组件，它会自动获取TikTok视频 */}
          <VideoPlayer onVideoChange={handleVideoChange} />
        </MainContent>
        <RightSider width={300}>
          <ActionPanel content={currentVideo} />
        </RightSider>
      </Layout>
    </StyledLayout>
  );
};

export default MainFeed;