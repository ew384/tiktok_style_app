// server/scripts/test_extract.js
const { spawn } = require('child_process');
const path = require('path');

// 要测试的URL
const testUrl = 'https://www.douyin.com/discover/search/%E4%B8%AD%E4%BF%A1%E9%93%B6%E8%A1%8C%E4%BF%A1%E7%94%A8%E5%8D%A1?aid=a72dd233-9221-4b77-a0ce-c998d41d8e35&modal_id=7344275866215664911&type=general';

// Python脚本路径
const pythonScriptPath = path.join(__dirname, 'extract_video.py');

console.log(`测试Python视频提取，URL: ${testUrl}`);
console.log(`使用脚本: ${pythonScriptPath}`);

// 启动Python进程
const python = spawn('python3', [pythonScriptPath, testUrl]);

// 收集输出
let stdout = '';
let stderr = '';

python.stdout.on('data', (data) => {
    stdout += data.toString();
    console.log(`Python输出: ${data}`);
});

python.stderr.on('data', (data) => {
    stderr += data.toString();
    console.log(`Python stderr: ${data}`);
});

// 处理完成
python.on('close', (code) => {
    console.log(`Python进程退出，退出码 ${code}`);

    if (code === 0) {
        try {
            const result = JSON.parse(stdout);
            console.log('提取结果:');
            console.log(JSON.stringify(result, null, 2));

            if (result.success) {
                console.log('测试成功! 成功提取视频URL.');
            } else {
                console.log(`测试失败: ${result.error}`);
            }
        } catch (error) {
            console.error(`解析结果失败: ${error.message}`);
        }
    } else {
        console.error(`Python脚本执行失败，退出码: ${code}`);
        console.error(`错误输出: ${stderr}`);
    }
});