#!/usr/bin/env python3
# extract_tiktok.py - 基于TikTok_download_v1.py的视频提取脚本

import requests
import re
import json
import time
import sys
import os
import random
from typing import List, Optional, Dict, Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

class TiktokExtractor:
    """抖音视频提取器：基于最新版本的TikTok_download_v1.py"""

    def __init__(self, headless: bool = True, random_ua: bool = True):
        """初始化提取器
        
        Args:
            headless: 是否使用无头模式运行浏览器
            random_ua: 是否使用随机User-Agent
        """
        self.headers = self._get_headers(random_ua)
        self.driver = None
        self.headless = headless
        self._setup_selenium()
            
    def _get_headers(self, random_ua: bool = True) -> Dict[str, str]:
        """获取请求头，可选择使用随机User-Agent
        
        Args:
            random_ua: 是否使用随机User-Agent
            
        Returns:
            请求头字典
        """
        # 常用的User-Agent列表
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        ]
        
        # 随机选择User-Agent或使用默认值
        user_agent = user_agents[int(time.time()) % len(user_agents)] if random_ua else user_agents[0]
        
        return {
            'User-Agent': user_agent,
            'Referer': 'https://www.douyin.com/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1'
        }

    def _setup_selenium(self) -> None:
        """设置Selenium WebDriver，启用网络请求监控并配置反指纹检测"""
        try:
            chrome_options = Options()
            if self.headless:
                chrome_options.add_argument('--headless')
            
            # 基本配置
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            
            # 反指纹检测配置
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # 设置用户代理
            chrome_options.add_argument(f'user-agent={self.headers["User-Agent"]}')
            
            # 为新版Selenium设置性能日志
            chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
            
            # 创建Chrome驱动
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(
                service=service, 
                options=chrome_options
            )
            
            # 通过执行JavaScript来绕过Navigator.webdriver检测
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            print("Selenium WebDriver 初始化成功", file=sys.stderr)
        except Exception as e:
            print(f"Selenium WebDriver 初始化失败: {e}", file=sys.stderr)
            raise

    def _close_selenium(self) -> None:
        """关闭Selenium WebDriver"""
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                print(f"关闭WebDriver失败: {e}", file=sys.stderr)
            finally:
                self.driver = None

    def extract_video_id(self, url: str) -> Optional[str]:
        """从URL中提取视频ID
        
        Args:
            url: 抖音视频URL

        Returns:
            视频ID或None
        """
        try:
            # 处理分享链接
            if 'v.douyin.com' in url:
                try:
                    response = requests.get(url, headers=self.headers, allow_redirects=False)
                    if 'Location' in response.headers:
                        url = response.headers['Location']
                except Exception as e:
                    print(f"处理短链接跳转失败: {e}", file=sys.stderr)
            
            # 检查是否是搜索结果中的视频
            if 'modal_id=' in url:
                modal_id_match = re.search(r'modal_id=(\d+)', url)
                if modal_id_match:
                    video_id = modal_id_match.group(1)
                    print(f"从搜索页面提取到视频ID: {video_id}", file=sys.stderr)
                    return video_id
            
            # 尝试多种模式提取ID
            patterns = [
                r'/video/(\d+)',
                r'modal_id=(\d+)'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, url)
                if match:
                    video_id = match.group(1)
                    print(f"提取到视频ID: {video_id}", file=sys.stderr)
                    return video_id
            
            print(f"无法从URL中提取视频ID: {url}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"提取视频ID失败: {e}", file=sys.stderr)
            return None

    def _setup_cookies(self) -> None:
        """设置cookies，使用默认值或生成随机值"""
        if not self.driver:
            return
            
        try:
            # 先访问一次抖音首页
            self.driver.get('https://www.douyin.com/')
            time.sleep(2)
            
            # 设置一些基本的cookies以绕过简单的检测
            default_cookies = [
                {'name': 'douyin.com', 'value': 'true', 'domain': '.douyin.com'},
                {'name': 'ttwid', 'value': '1%7CfR_G8yyVW246%7C1684123457%7C', 'domain': '.douyin.com'},
                {'name': 'msToken', 'value': self._generate_random_hex(120), 'domain': '.douyin.com'},
                {'name': 'tt_csrf_token', 'value': self._generate_random_hex(16), 'domain': '.douyin.com'},
            ]
            
            for cookie in default_cookies:
                try:
                    self.driver.add_cookie(cookie)
                except Exception as e:
                    print(f"添加Cookie失败 {cookie['name']}: {e}", file=sys.stderr)
            
            # 刷新页面应用cookies
            self.driver.refresh()
            time.sleep(1)
            
            print("已应用基本Cookie", file=sys.stderr)
            
        except Exception as e:
            print(f"设置cookies失败: {e}", file=sys.stderr)
    
    def _generate_random_hex(self, length: int) -> str:
        """生成指定长度的随机十六进制字符串
        
        Args:
            length: 字符串长度
            
        Returns:
            随机十六进制字符串
        """
        return ''.join(random.choice('0123456789abcdef') for _ in range(length))
            
    def extract_video_urls(self, douyin_url: str, wait_time: int = 5) -> List[str]:
        """提取抖音视频的直链地址
        
        Args:
            douyin_url: 抖音视频页面URL
            wait_time: 页面加载等待时间(秒)
            
        Returns:
            视频URL列表
        """
        if not self.driver:
            print("Selenium未启用，无法提取视频URL", file=sys.stderr)
            return []
            
        try:
            print(f"正在分析链接: {douyin_url}", file=sys.stderr)
            
            # 处理搜索页面中的视频
            if 'discover/search' in douyin_url and 'modal_id=' in douyin_url:
                video_id = self.extract_video_id(douyin_url)
                if video_id:
                    direct_url = f"https://www.douyin.com/video/{video_id}"
                    print(f"从搜索页面转为直接视频页面: {direct_url}", file=sys.stderr)
                    douyin_url = direct_url
            
            # 设置页面加载超时
            self.driver.set_page_load_timeout(30)
            
            # 加载页面
            self.driver.get(douyin_url)
            print("页面加载中，请稍候...", file=sys.stderr)
            
            # 设置cookie (如果是第一次访问)
            if '/video/' in douyin_url:
                self._setup_cookies()
                
            # 等待页面加载
            time.sleep(wait_time)
            
            # 尝试滚动页面以加载视频
            try:
                # 模拟真实用户行为，随机滚动几次
                for _ in range(3):
                    scroll_y = random.randint(100, 500)
                    self.driver.execute_script(f"window.scrollTo(0, {scroll_y})")
                    time.sleep(random.uniform(0.5, 1.5))
            except Exception as e:
                print(f"页面滚动失败: {e}", file=sys.stderr)
            
            # 收集所有可能的视频URL
            video_urls = []
            
            # 尝试使用多种方法获取视频URL
            video_urls.extend(self._get_urls_from_performance_logs())
            
            if not video_urls:
                video_urls.extend(self._get_urls_from_performance_entries())
            
            if not video_urls:
                video_urls.extend(self._get_urls_from_video_elements())
                
            if not video_urls:
                video_urls.extend(self._get_urls_from_network_resources())
            
            # 过滤和处理结果
            filtered_urls = self._filter_video_urls(video_urls)
            
            if filtered_urls:
                print(f"找到 {len(filtered_urls)} 个视频URL", file=sys.stderr)
                for i, url in enumerate(filtered_urls[:3]):  # 只显示前3个
                    print(f"URL {i+1}: {url[:100]}...", file=sys.stderr)
            else:
                print("未找到视频URL", file=sys.stderr)
                
            return filtered_urls
            
        except Exception as e:
            print(f"提取视频URL失败: {e}", file=sys.stderr)
            return []

    def _get_urls_from_performance_logs(self) -> List[str]:
        """从浏览器性能日志中获取视频URL"""
        video_urls = []
        try:
            logs = self.driver.get_log('performance')
            for log in logs:
                try:
                    log_entry = json.loads(log['message'])['message']
                    
                    # 过滤网络请求
                    if ('Network.responseReceived' in log_entry['method'] or 
                        'Network.requestWillBeSent' in log_entry['method']):
                        
                        # 获取URL
                        if 'Network.responseReceived' in log_entry['method']:
                            url = log_entry['params']['response']['url']
                        else:
                            url = log_entry['params']['request']['url']
                        
                        # 筛选视频URL
                        if self._is_video_url(url):
                            video_urls.append(url)
                except:
                    continue
        except Exception as e:
            print(f"从性能日志获取视频URL失败: {e}", file=sys.stderr)
        
        return video_urls

    def _get_urls_from_performance_entries(self) -> List[str]:
        """使用JavaScript从performance entries获取视频URL"""
        video_urls = []
        try:
            js_results = self.driver.execute_script("""
                return window.performance.getEntries().filter(function(entry) {
                    return (entry.name.includes('douyinvod.com/') || 
                            entry.name.includes('/tos/') ||
                            entry.name.includes('aweme.snssdk.com/') ||
                            entry.name.includes('.mp4') ||
                            entry.name.includes('mime_type=video_mp4'));
                }).map(function(entry) {
                    return entry.name;
                });
            """)
            if js_results:
                video_urls.extend(js_results)
        except Exception as e:
            print(f"JS方法获取性能记录失败: {e}", file=sys.stderr)
        
        return video_urls

    def _get_urls_from_video_elements(self) -> List[str]:
        """从视频元素直接获取URL"""
        video_urls = []
        try:
            video_elements = self.driver.find_elements(By.TAG_NAME, "video")
            for video in video_elements:
                src = video.get_attribute('src')
                if src and self._is_video_url(src):
                    video_urls.append(src)
        except Exception as e:
            print(f"从视频元素获取URL失败: {e}", file=sys.stderr)
        
        return video_urls
        
    def _get_urls_from_network_resources(self) -> List[str]:
        """从页面资源中提取视频URL"""
        video_urls = []
        try:
            # 获取页面HTML
            page_source = self.driver.page_source
            
            # 在页面源码中查找视频URL模式
            # 尝试提取JSON数据中的视频URL
            json_pattern = r'"play_addr":.*?"url_list":\s*\[(.*?)\]'
            json_matches = re.findall(json_pattern, page_source)
            
            for match in json_matches:
                # 从JSON字符串中提取URL
                url_matches = re.findall(r'"(https?:[^"]+)"', match)
                for url in url_matches:
                    if self._is_video_url(url):
                        video_urls.append(url)
            
            # 直接查找视频URL
            url_pattern = r'(https?://[^"\'\s]+\.mp4[^"\'\s]*)'
            url_matches = re.findall(url_pattern, page_source)
            
            for url in url_matches:
                if self._is_video_url(url):
                    video_urls.append(url)
                    
        except Exception as e:
            print(f"从网络资源获取视频URL失败: {e}", file=sys.stderr)
        
        return video_urls

    def _is_video_url(self, url: str) -> bool:
        """判断URL是否为视频URL"""
        video_indicators = [
            'douyinvod.com',
            '/tos/',
            'aweme.snssdk.com',
            '.mp4',
            'mime_type=video_mp4',
            'play_addr',
            'video_id='
        ]
        
        return any(indicator in url for indicator in video_indicators)

    def _filter_video_urls(self, video_urls: List[str]) -> List[str]:
        """过滤重复URL并按优先级排序"""
        filtered_urls = []
        for url in video_urls:
            if url not in filtered_urls:
                filtered_urls.append(url)
        
        # 排序规则：首选包含douyinvod.com的URL，然后是mp4，最后是其他
        def sort_key(url):
            if 'douyinvod.com' in url:
                return 0
            if '.mp4' in url:
                return 1
            if 'aweme.snssdk.com' in url:
                return 2
            return 3
            
        return sorted(filtered_urls, key=sort_key)

    def get_video_url_api(self, video_id: str) -> List[str]:
        """使用API获取视频URL
        
        Args:
            video_id: 视频ID
            
        Returns:
            视频URL列表
        """
        try:
            # 尝试多个可能的API端点
            api_endpoints = [
                f"https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id={video_id}",
                f"https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids={video_id}"
            ]
            
            for api_url in api_endpoints:
                try:
                    print(f"尝试API: {api_url}", file=sys.stderr)
                    response = requests.get(api_url, headers=self.headers)
                    
                    if response.status_code != 200:
                        continue
                        
                    data = response.json()
                    
                    # 第一种API响应结构
                    if 'aweme_detail' in data and 'video' in data['aweme_detail']:
                        video_data = data['aweme_detail']['video']
                        if 'play_addr' in video_data and 'url_list' in video_data['play_addr']:
                            urls = video_data['play_addr']['url_list']
                            print(f"从API1获取到 {len(urls)} 个URL", file=sys.stderr)
                            return urls
                    
                    # 第二种API响应结构
                    if 'item_list' in data and len(data['item_list']) > 0:
                        item = data['item_list'][0]
                        if 'video' in item and 'play_addr' in item['video']:
                            play_addr = item['video']['play_addr']
                            if 'url_list' in play_addr and play_addr['url_list']:
                                urls = play_addr['url_list']
                                print(f"从API2获取到 {len(urls)} 个URL", file=sys.stderr)
                                return urls
                
                except Exception as e:
                    print(f"API {api_url} 调用失败: {e}", file=sys.stderr)
            
            print("所有API调用失败", file=sys.stderr)
            return []
            
        except Exception as e:
            print(f"API方法获取视频URL失败: {e}", file=sys.stderr)
            return []

    def extract_from_url(self, url: str) -> Dict[str, Any]:
        """从URL提取视频信息
        
        Args:
            url: 视频URL
            
        Returns:
            包含视频信息的字典
        """
        result = {
            "success": False,
            "id": None,
            "url": None,
            "thumbnail": None,
            "title": None,
            "author": None
        }
        
        try:
            # 提取视频ID
            video_id = self.extract_video_id(url)
            if not video_id:
                result["error"] = "无法提取视频ID"
                return result
            
            result["id"] = video_id
            
            # 设置缩略图
            result["thumbnail"] = f"https://p.ipstatp.com/origin/tos-cn-p-0015/{video_id}~tplv-r00ih89hin-image.jpeg"
            
            # 尝试API方法获取视频URL
            api_urls = self.get_video_url_api(video_id)
            if api_urls:
                result["success"] = True
                result["url"] = api_urls[0]
                result["source"] = "douyin_api"
                result["title"] = f"抖音视频 #{video_id}"
                result["author"] = "抖音用户"
                
                print(f"API成功获取视频URL: {result['url'][:100]}...", file=sys.stderr)
                return result
            
            # 如果API方法失败，尝试从页面提取
            print(f"API方法失败，尝试从页面提取视频URL", file=sys.stderr)
            
            # 使用Selenium访问页面获取视频URL
            page_urls = self.extract_video_urls(url, wait_time=5)
            
            if page_urls:
                result["success"] = True
                result["url"] = page_urls[0]
                result["source"] = "douyin_page"
                result["title"] = f"抖音视频 #{video_id}"
                result["author"] = "抖音用户"
                
                print(f"页面提取成功获取视频URL: {result['url'][:100]}...", file=sys.stderr)
                return result
            
            # 如果仍然失败，返回错误
            result["error"] = "无法获取视频URL"
            return result
            
        except Exception as e:
            print(f"提取视频失败: {e}", file=sys.stderr)
            result["error"] = str(e)
            return result
        finally:
            # 关闭浏览器
            self._close_selenium()

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "请提供视频URL"}))
        return
    
    url = sys.argv[1]
    
    # 解析命令行参数
    headless = True
    if len(sys.argv) > 2 and sys.argv[2] == '--no-headless':
        headless = False
    
    random_ua = True
    if len(sys.argv) > 3 and sys.argv[3] == '--no-random-ua':
        random_ua = False
    
    print(f"开始提取视频: {url}", file=sys.stderr)
    print(f"参数: headless={headless}, random_ua={random_ua}", file=sys.stderr)
    
    extractor = TiktokExtractor(headless=headless, random_ua=random_ua)
    result = extractor.extract_from_url(url)
    
    # 输出JSON结果
    print(json.dumps(result))

if __name__ == "__main__":
    main()