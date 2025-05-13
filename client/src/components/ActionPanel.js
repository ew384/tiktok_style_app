import React from 'react';
import styled from 'styled-components';
import { Card, Button, List, Avatar, Tag } from 'antd';
import { ShoppingOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons';

const PanelContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 15px;
  background: #1f1f1f;
  color: white;
`;

const SectionTitle = styled.h3`
  margin-bottom: 15px;
  font-size: 16px;
  color: white;
`;

const ActionCard = styled(Card)`
  margin-bottom: 15px;
  background: #2c2c2c;
  border: 1px solid #333;
  
  .ant-card-head {
    color: white;
    border-bottom: 1px solid #333;
  }
  
  .ant-card-body {
    color: #ddd;
  }
`;

const ProductItem = styled.div`
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ProductPrice = styled.div`
  color: #ff4d4f;
  font-weight: bold;
  margin-bottom: 10px;
`;

const TagsContainer = styled.div`
  margin-bottom: 15px;
`;

const ActionPanel = ({ content }) => {
    if (!content) {
        return (
            <PanelContainer>
                <SectionTitle>相关操作</SectionTitle>
                <div style={{ color: '#999', textAlign: 'center' }}>
                    选择一个内容查看相关操作
                </div>
            </PanelContainer>
        );
    }

    const renderProductSection = () => {
        if (!content.products || content.products.length === 0) return null;

        return (
            <ActionCard title="相关商品">
                {content.products.map(product => (
                    <ProductItem key={product.id}>
                        <ProductImage src={product.imageUrl} alt={product.title} />
                        <ProductInfo>
                            <ProductTitle>{product.title}</ProductTitle>
                            <ProductPrice>¥{product.price}</ProductPrice>
                            <Button
                                type="primary"
                                size="small"
                                icon={<ShoppingOutlined />}
                                onClick={() => window.open(product.link, '_blank')}
                            >
                                购买
                            </Button>
                        </ProductInfo>
                    </ProductItem>
                ))}
            </ActionCard>
        );
    };

    const renderRelatedContent = () => {
        if (!content.relatedContents || content.relatedContents.length === 0) return null;

        return (
            <ActionCard title="相关内容">
                <List
                    itemLayout="horizontal"
                    dataSource={content.relatedContents}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.thumbnailUrl} />}
                                title={<a href={`/content/${item.id}`} style={{ color: 'white' }}>{item.title}</a>}
                                description={<span style={{ color: '#999' }}>{item.description.substring(0, 50)}...</span>}
                            />
                        </List.Item>
                    )}
                />
            </ActionCard>
        );
    };

    const renderTags = () => {
        if (!content.tags || content.tags.length === 0) return null;

        return (
            <TagsContainer>
                {content.tags.map(tag => (
                    <Tag key={tag} color="blue" style={{ marginBottom: '5px' }}>
                        #{tag}
                    </Tag>
                ))}
            </TagsContainer>
        );
    };

    const renderSourceInfo = () => {
        if (!content.source) return null;

        return (
            <ActionCard title="内容来源">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={content.source.iconUrl} size="small" style={{ marginRight: '10px' }} />
                    <div>{content.source.name}</div>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <Button
                        type="link"
                        icon={<LinkOutlined />}
                        onClick={() => window.open(content.source.url, '_blank')}
                    >
                        查看原始内容
                    </Button>
                </div>
            </ActionCard>
        );
    };

    return (
        <PanelContainer>
            <SectionTitle>相关操作</SectionTitle>
            {renderTags()}
            {renderProductSection()}
            {renderSourceInfo()}
            {renderRelatedContent()}
            <ActionCard title="分享内容">
                <Button.Group style={{ width: '100%' }}>
                    <Button style={{ width: '50%' }} icon={<i className="fab fa-weixin" />}>微信</Button>
                    <Button style={{ width: '50%' }} icon={<i className="fab fa-weibo" />}>微博</Button>
                </Button.Group>
            </ActionCard>
        </PanelContainer>
    );
};

export default ActionPanel;