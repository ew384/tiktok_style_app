import React, { useState, useEffect, useRef } from 'react';
import { Input, AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { searchContent, getSuggestions } from '../services/searchService';
import { useNavigate } from 'react-router-dom';

const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const StyledAutoComplete = styled(AutoComplete)`
  width: 100%;
  
  .ant-select-selector {
    background-color: #333 !important;
    border: none !important;
  }
  
  .ant-input {
    background-color: #333;
    color: white;
    border: none;
    
    &::placeholder {
      color: #999;
    }
  }
  
  .ant-select-selection-search-input {
    color: white;
  }
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
`;

const SuggestionIcon = styled.span`
  margin-right: 8px;
  color: #999;
`;

const SuggestionText = styled.span`
  color: white;
`;

const SearchBar = () => {
    const [value, setValue] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);

    const fetchSuggestions = async (query) => {
        if (!query) {
            setOptions([]);
            return;
        }

        setLoading(true);
        try {
            const suggestions = await getSuggestions(query);
            const formattedOptions = suggestions.map(suggestion => ({
                value: suggestion.text,
                label: (
                    <SuggestionItem>
                        <SuggestionIcon><SearchOutlined /></SuggestionIcon>
                        <SuggestionText>{suggestion.text}</SuggestionText>
                    </SuggestionItem>
                )
            }));

            setOptions(formattedOptions);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSearch = (searchText) => {
        setValue(searchText);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(searchText);
        }, 300);
    };

    const onSelect = (selectedValue) => {
        setValue(selectedValue);
        navigate(`/search?q=${encodeURIComponent(selectedValue)}`);
    };

    const handleSearch = () => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value.trim())}`);
        }
    };

    return (
        <SearchContainer>
            <StyledAutoComplete
                value={value}
                options={options}
                onSelect={onSelect}
                onSearch={onSearch}
                notFoundContent={null}
            >
                <Input
                    placeholder="搜索内容..."
                    suffix={<SearchOutlined style={{ color: '#999' }} onClick={handleSearch} />}
                    onPressEnter={handleSearch}
                />
            </StyledAutoComplete>
        </SearchContainer>
    );
};

export default SearchBar;