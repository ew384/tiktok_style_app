// client/src/components/ChatSection.js (修改版)
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Input, Button, Avatar, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { fetchMessages, sendMessage } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1f1f1f;
  color: white;
`;

const ChatHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #333;
  font-weight: bold;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
`;

const MessageBubble = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
`;

const MessageContent = styled.div`
  max-width: 70%;
  margin: ${props => props.isOwn ? '0 10px 0 0' : '0 0 0 10px'};
`;

const MessageText = styled.div`
  background: ${props => props.isOwn ? '#0084ff' : '#333'};
  padding: 10px;
  border-radius: 18px;
  word-break: break-word;
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #333;
`;

const StyledInput = styled(Input)`
  background: #333;
  border: none;
  border-radius: 20px;
  color: white;
  padding: 10px 15px;
  
  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled(Button)`
  margin-left: 10px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const EmptyMessages = styled.div`
  text-align: center;
  color: #999;
  margin-top: 20px;
`;

const ChatSection = ({ contentId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // 重置消息并加载新消息
        setMessages([]);

        if (contentId) {
            console.log(`加载内容ID为 ${contentId} 的消息`);
            setLoading(true);

            // 允许为视频生成默认消息，即使没有在数据库中找到
            const defaultMessages = [
                {
                    contentId: contentId,
                    user: {
                        id: 'system',
                        username: '系统消息',
                        avatar: 'https://via.placeholder.com/40?text=系统'
                    },
                    text: '欢迎来到讨论区，这里可以讨论有关该视频的内容。',
                    timestamp: new Date().toISOString()
                },
                {
                    contentId: contentId,
                    user: {
                        id: 'system',
                        username: '提示',
                        avatar: 'https://via.placeholder.com/40?text=提示'
                    },
                    text: '请文明发言，共建和谐社区。',
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                }
            ];

            fetchMessages(contentId)
                .then(data => {
                    setMessages(data.length > 0 ? data : defaultMessages);
                    setLoading(false);
                    scrollToBottom();
                })
                .catch(error => {
                    console.error('加载消息失败:', error);
                    // 使用默认消息
                    setMessages(defaultMessages);
                    setLoading(false);
                    scrollToBottom();
                });

            // 设置Socket.io连接
            try {
                socketRef.current = io('/chat');

                // 监听新消息
                socketRef.current.on('message', message => {
                    if (message.contentId === contentId) {
                        setMessages(prev => [...prev, message]);
                        scrollToBottom();
                    }
                });

                // 加入特定内容的聊天室
                socketRef.current.emit('join', { contentId });
            } catch (error) {
                console.error('Socket连接失败:', error);
            }

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [contentId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !user || !contentId) return;

        const message = {
            contentId,
            text: newMessage.trim(),
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar
            },
            timestamp: new Date().toISOString()
        };

        try {
            if (socketRef.current) {
                socketRef.current.emit('message', message);
            } else {
                // 如果socket连接失败，直接更新本地消息列表
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            // 即使发送失败，也更新本地消息列表，提升用户体验
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        }

        setNewMessage('');
    };

    const formatTime = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            return '未知时间';
        }
    };

    return (
        <ChatContainer>
            <ChatHeader>实时评论</ChatHeader>
            <MessagesContainer>
                {loading ? (
                    <LoadingContainer>
                        <Spin />
                    </LoadingContainer>
                ) : (
                    <>
                        {messages.length === 0 ? (
                            <EmptyMessages>
                                暂无评论，来发表第一条评论吧！
                            </EmptyMessages>
                        ) : (
                            messages.map((message, index) => (
                                <MessageBubble
                                    key={index}
                                    isOwn={message.user.id === user?.id}
                                >
                                    <Avatar src={message.user.avatar} alt={message.user.username} />
                                    <MessageContent isOwn={message.user.id === user?.id}>
                                        <MessageText isOwn={message.user.id === user?.id}>
                                            {message.text}
                                        </MessageText>
                                        <MessageTime isOwn={message.user.id === user?.id}>
                                            {formatTime(message.timestamp)}
                                        </MessageTime>
                                    </MessageContent>
                                </MessageBubble>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </MessagesContainer>
            <InputContainer>
                <StyledInput
                    placeholder="发送评论..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={handleSendMessage}
                />
                <SendButton
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                />
            </InputContainer>
        </ChatContainer>
    );
};

export default ChatSection;