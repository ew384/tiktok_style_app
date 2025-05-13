import React from 'react';
import { useParams } from 'react-router-dom';
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

const Profile = () => {
    const { userId } = useParams();

    return (
        <StyledLayout>
            <StyledHeader>
                <h2 style={{ color: 'white' }}>用户个人资料</h2>
            </StyledHeader>
            <MainContent>
                <div>
                    <h1>用户资料 (ID: {userId})</h1>
                    <p>这里将展示用户资料和内容</p>
                    <p>正在开发中...</p>
                </div>
            </MainContent>
        </StyledLayout>
    );
};

export default Profile;