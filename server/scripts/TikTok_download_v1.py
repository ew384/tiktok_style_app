import requests
import re
import json
import time
import os
from typing import List, Optional, Dict, Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


class DouyinVideoDownloader:
    """抖音视频下载器：用于提取和下载抖音视频"""

    def __init__(self, use_selenium: bool = True, headless: bool = False, random_ua: bool = True):
        """初始化下载器

        Args:
            use_selenium: 是否使用Selenium进行URL提取
            headless: 是否使用无头模式运行浏览器
            random_ua: 是否使用随机User-Agent
        """
        self.headers = self._get_headers(random_ua)
        self.use_selenium = use_selenium
        self.driver = None
        self.headless = headless
        
        if use_selenium:
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
            
            # 禁用图片加载，提高速度（可选）
            # chrome_options.add_argument('--blink-settings=imagesEnabled=false')
            
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
            
            print("Selenium WebDriver 初始化成功")
        except Exception as e:
            print(f"Selenium WebDriver 初始化失败: {e}")
            self.use_selenium = False
    
    def _close_selenium(self) -> None:
        """关闭Selenium WebDriver"""
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                print(f"关闭WebDriver失败: {e}")
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
                response = requests.get(url, headers=self.headers, allow_redirects=False)
                if 'Location' in response.headers:
                    url = response.headers['Location']
            
            # 尝试多种模式提取ID
            patterns = [
                r'/video/(\d+)',
                r'modal_id=(\d+)'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, url)
                if match:
                    return match.group(1)
            
            print(f"无法从URL中提取视频ID: {url}")
            return None
        except Exception as e:
            print(f"提取视频ID失败: {e}")
            return None

    def _setup_cookies(self, cookie_file: str = None) -> None:
        """设置cookies，可以从文件加载或使用默认值
        
        Args:
            cookie_file: cookie文件路径，None则使用默认cookie
        """
        if not self.driver:
            return
            
        try:
            # 先访问一次抖音首页
            self.driver.get('https://www.douyin.com/')
            time.sleep(2)
            
            if cookie_file and os.path.exists(cookie_file):
                # 从文件加载cookies
                with open(cookie_file, 'r') as f:
                    cookies = json.load(f)
                for cookie in cookies:
                    try:
                        self.driver.add_cookie(cookie)
                    except:
                        continue
                print(f"已加载Cookie文件: {cookie_file}")
            else:
                # 设置一些基本的cookies以绕过简单的检测
                default_cookies = [
                    {'name': 'douyin.com', 'value': 'true', 'domain': '.douyin.com'},
                    {'name': 'ttwid', 'value': '1%7CfR_G8yyVW246%7C1684123457%7C', 'domain': '.douyin.com'},
                ]
                for cookie in default_cookies:
                    try:
                        self.driver.add_cookie(cookie)
                    except:
                        continue
            
            # 刷新页面应用cookies
            self.driver.refresh()
            time.sleep(1)
            
        except Exception as e:
            print(f"设置cookies失败: {e}")
            
    def extract_douyin_video_urls(self, douyin_url: str, wait_time: int = 5) -> List[str]:
        """专门用于提取抖音视频的直链地址
        
        Args:
            douyin_url: 抖音视频页面URL
            wait_time: 页面加载等待时间(秒)
            
        Returns:
            视频URL列表
        """
        if not self.use_selenium or not self.driver:
            print("Selenium未启用，无法提取视频URL")
            return []
            
        try:
            print(f"正在分析链接: {douyin_url}")
            
            # 设置页面加载超时
            self.driver.set_page_load_timeout(20)
            
            # 加载页面
            self.driver.get(douyin_url)
            print("页面加载中，请稍候...")
            
            # 设置cookie (如果是第一次访问)
            if '/video/' in douyin_url:
                self._setup_cookies()
                
            # 等待页面加载
            time.sleep(wait_time)
            
            # 尝试滚动页面以加载视频
            try:
                self.driver.execute_script("window.scrollTo(0, 300)")
                time.sleep(1)
            except:
                pass
            
            # 收集所有可能的视频URL
            video_urls = []
            
            # 尝试三种方法获取视频URL
            video_urls.extend(self._get_urls_from_performance_logs())
            
            if not video_urls:
                video_urls.extend(self._get_urls_from_performance_entries())
            
            if not video_urls:
                video_urls.extend(self._get_urls_from_video_elements())
            
            # 过滤和处理结果
            return self._filter_video_urls(video_urls)
            
        except Exception as e:
            print(f"提取视频URL失败: {e}")
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
            print(f"从性能日志获取视频URL失败: {e}")
        
        return video_urls

    def _get_urls_from_performance_entries(self) -> List[str]:
        """使用JavaScript从performance entries获取视频URL"""
        video_urls = []
        try:
            js_results = self.driver.execute_script("""
                return window.performance.getEntries().filter(function(entry) {
                    return (entry.name.includes('douyinvod.com/video') || 
                            entry.name.includes('/tos/') ||
                            entry.name.includes('mime_type=video_mp4'));
                }).map(function(entry) {
                    return entry.name;
                });
            """)
            if js_results:
                video_urls.extend(js_results)
        except Exception as e:
            print(f"JS方法获取性能记录失败: {e}")
        
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
            print(f"从视频元素获取URL失败: {e}")
        
        return video_urls

    def _is_video_url(self, url: str) -> bool:
        """判断URL是否为视频URL"""
        return (('douyinvod.com/video' in url or '/tos/' in url) and 
                ('mime_type=video_mp4' in url or '.mp4' in url))

    def _filter_video_urls(self, video_urls: List[str]) -> List[str]:
        """过滤重复URL并按优先级排序"""
        filtered_urls = []
        for url in video_urls:
            if url not in filtered_urls:
                filtered_urls.append(url)
        
        # 优先选择douyinvod.com域名的URL
        return sorted(filtered_urls, 
                     key=lambda url: 0 if 'douyinvod.com' in url else 1)

    def get_video_url_api(self, video_id: str) -> List[str]:
        """使用API获取视频URL
        
        Args:
            video_id: 视频ID
            
        Returns:
            视频URL列表
        """
        try:
            # 构建API URL
            api_url = f"https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id={video_id}"
            
            response = requests.get(api_url, headers=self.headers)
            data = response.json()
            
            # 提取无水印视频URL
            if 'aweme_detail' in data and 'video' in data['aweme_detail']:
                video_data = data['aweme_detail']['video']
                if 'play_addr' in video_data and 'url_list' in video_data['play_addr']:
                    return video_data['play_addr']['url_list']
            
            return []
        except Exception as e:
            print(f"API方法获取视频URL失败: {e}")
            return []

    def download_video(self, video_url: str, output_path: str) -> bool:
        """下载视频到指定路径
        
        Args:
            video_url: 视频URL
            output_path: 输出路径
            
        Returns:
            下载是否成功
        """
        try:
            # 确保输出目录存在
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            print(f"正在下载视频: {video_url}")
            response = requests.get(video_url, headers=self.headers, stream=True)
            response.raise_for_status()  # 确保请求成功
            
            total_size = int(response.headers.get('content-length', 0))
            
            with open(output_path, 'wb') as file:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        file.write(chunk)
                        downloaded += len(chunk)
                        # 显示下载进度
                        if total_size > 0:
                            progress = int(50 * downloaded / total_size)
                            print(f"\r下载进度: [{'#' * progress}{'.' * (50 - progress)}] {downloaded/total_size*100:.2f}%", end='')
            
            print("\n下载完成!")
            return True
        except Exception as e:
            print(f"下载视频失败: {e}")
            return False
    
    def process_url(self, url: str, output_path: str = "douyin_video.mp4") -> bool:
        """处理URL并下载视频
        
        Args:
            url: 抖音视频URL
            output_path: 输出路径
            
        Returns:
            处理是否成功
        """
        # 提取视频ID
        video_id = self.extract_video_id(url)
        if not video_id:
            return False
        
        print(f"提取到视频ID: {video_id}")
        
        # 尝试不同方法获取视频URL
        video_urls = []
        
        # 方法1: 使用Selenium直接从页面提取
        if self.use_selenium and self.driver:
            video_urls = self.extract_douyin_video_urls(url)
            if video_urls:
                print(f"找到 {len(video_urls)} 个视频URL")
                self._print_urls(video_urls)
                
                # 选择第一个URL进行下载
                return self.download_video(video_urls[0], output_path)
        
        # 方法2: 使用API获取视频URL
        video_urls = self.get_video_url_api(video_id)
        if video_urls:
            print(f"使用API找到 {len(video_urls)} 个视频URL")
            self._print_urls(video_urls)
            
            # 选择第一个URL进行下载
            return self.download_video(video_urls[0], output_path)
        
        print("无法获取视频URL，请检查链接或稍后再试")
        return False
    
    def _print_urls(self, urls: List[str]) -> None:
        """打印URL列表"""
        for i, url in enumerate(urls):
            print(f"{i+1}. {url}")
    
    def __del__(self):
        """析构函数，确保关闭WebDriver"""
        self._close_selenium()


def main():
    """主函数，处理命令行交互"""
    print("=== 抖音视频下载工具 ===")
    print("1. 提取抖音视频页面中的视频链接")
    print("2. 下载指定URL的视频")
    print("3. 一键下载抖音视频")
    
    try:
        choice = input("请选择功能 (1/2/3): ")
        
        use_headless = input("是否使用无头模式运行浏览器? (y/n, 默认n): ").lower() == 'y'
        use_random_ua = input("是否使用随机User-Agent? (y/n, 默认y): ").lower() != 'n'
        
        downloader = DouyinVideoDownloader(use_selenium=True, headless=use_headless, random_ua=use_random_ua)
        
        wait_time = 5
        try:
            custom_wait = input("请输入页面加载等待时间(秒)，默认5秒: ")
            if custom_wait:
                wait_time = int(custom_wait)
        except:
            pass
        
        if choice == "1":
            # 提取视频链接
            douyin_url = input("请输入抖音视频页面URL: ")
            video_urls = downloader.extract_douyin_video_urls(douyin_url, wait_time=wait_time)
            
            if video_urls:
                print(f"\n找到 {len(video_urls)} 个视频URL:")
                for i, url in enumerate(video_urls):
                    print(f"\n{i+1}. {url}")
                
                save_choice = input("\n是否需要下载视频? (y/n): ")
                if save_choice.lower() == 'y':
                    index = int(input("请输入要下载的URL序号: ")) - 1
                    if 0 <= index < len(video_urls):
                        output_path = input("请输入保存路径(默认为当前目录的douyin_video.mp4): ") or "douyin_video.mp4"
                        downloader.download_video(video_urls[index], output_path)
                    else:
                        print("无效的序号")
            else:
                print("未找到视频URL，请检查链接是否正确或尝试其他方法")
        
        elif choice == "2":
            # 下载指定视频
            video_url = input("请输入视频直链URL: ")
            output_path = input("请输入保存路径(默认为当前目录的douyin_video.mp4): ") or "douyin_video.mp4"
            downloader.download_video(video_url, output_path)
        
        elif choice == "3":
            # 一键下载
            douyin_url = input("请输入抖音视频页面URL: ")
            output_path = input("请输入保存路径(默认为当前目录的douyin_video.mp4): ") or "douyin_video.mp4"
            success = downloader.process_url(douyin_url, output_path)
            if success:
                print(f"视频成功下载到: {output_path}")
            else:
                print("下载失败")
        
        else:
            print("无效的选择")
    
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        # 确保关闭浏览器
        if 'downloader' in locals():
            downloader._close_selenium()


if __name__ == "__main__":
    main()

