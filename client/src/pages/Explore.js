import React from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';

const { Header, Content } = Layout;

const StyledLayout = styled(Layout)`
  height: 100vh;
  background: #121212;
`;

const StyledHeader = styled(Header)`
  background: #202020;
  padding: 0 20px;
  display: flex;
  align-items: center;
`;

const MainContent = styled(Content)`
  background: #121212;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
`;

const Explore = () => {
    return (
        <StyledLayout>
            <StyledHeader>
                <h2 style={{ color: 'white' }}>探索</h2>
            </StyledHeader>
            <MainContent>
                <div>
                    <h1>探索页面</h1>
                    <p>这里将展示推荐内容和趋势</p>
                    <p>正在开发中...</p>
                </div>
            </MainContent>
        </StyledLayout>
    );
};

export default Explore;