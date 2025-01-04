# 导入所需的库
import logging  # 用于日志记录
import os  # 用于操作系统相关功能
import requests  # 用于发送HTTP请求
from dotenv import load_dotenv  # 用于加载环境变量

# 配置日志记录器
logging.basicConfig(level=logging.INFO)  # 设置日志级别为INFO
logger = logging.getLogger(__name__)  # 创建日志记录器实例

# 加载环境变量
load_dotenv()  # 从.env文件加载环境变量
API_KEY = os.getenv('ZHIPU_API_KEY')  # 获取智谱API密钥

# 检查API密钥是否存在
if not API_KEY:
    logger.error("未找到 ZHIPU_API_KEY 环境变量")
    raise ValueError("请在 .env 文件中设置 ZHIPU_API_KEY")

async def chat_with_ai(message: str):
    """
    调用智谱 AI 的聊天接口
    Args:
        message: 用户输入的消息
    Returns:
        AI的回复或错误信息
    """
    try:
        # 调用聊天 API
        location = "https://open.bigmodel.cn/api/paas/v4/chat/completions"  # API端点
        headers = {
            "Authorization": f"Bearer {API_KEY}",  # 设置认证头
            "Content-Type": "application/json"  # 设置内容类型
        }
        data = {
            "model": "glm-4",  # 使用GLM-4模型
            "messages": [
                {"role": "user", "content": message}  # 设置用户消息
            ]
        }

        # 记录请求信息
        logger.info(f"发送请求: {data}")
        # 发送POST请求
        response = requests.post(location, headers=headers, json=data)
        # 记录响应状态码
        logger.info(f"响应状态码: {response.status_code}")
        
        # 处理响应
        if response.status_code == 200:  # 如果请求成功
            result = response.json()  # 解析JSON响应
            logger.info(f"响应内容: {result}")  # 记录响应内容
            return result['choices'][0]['message']['content']  # 返回AI回复
        else:
            # 记录错误信息
            logger.error(f"HTTP 请求失败: {response.status_code} - {response.text}")
            return f"请求失败: {response.status_code}"
            
    except Exception as e:
        # 记录异常信息
        logger.error(f"调用智谱AI时发生错误: {str(e)}")
        return "抱歉，发生了一些错误。" 