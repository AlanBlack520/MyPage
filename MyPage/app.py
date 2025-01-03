# 导入必要的库
from aiohttp import web  # 异步Web服务器框架
import logging  # 日志记录
import os  # 操作系统功能
import tempfile  # 临时文件处理
import subprocess  # 子进程管理
import traceback  # 异常追踪
import aiohttp_cors  # CORS支持
import json  # JSON数据处理
from pathlib import Path  # 路径处理
import sys  # 系统功能
import time  # 时间处理
import asyncio  # 异步IO
from io import BytesIO  # 二进制IO
from api.zhipu import chat_with_ai  # 导入智谱AI聊天功能

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 获取当前脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
logger.info(f"脚本目录: {SCRIPT_DIR}")

# 设置临时目录
TEMP_DIR = os.path.join(SCRIPT_DIR, "temp")
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)
logger.info(f"临时目录: {TEMP_DIR}")

# 设置Julia脚本目录
MWORKS_SCRIPTS_PATH = os.path.join(SCRIPT_DIR, "mworks_scripts")
logger.info(f"Julia脚本目录: {MWORKS_SCRIPTS_PATH}")

async def handle_watermark(request):
    """处理水印请求的路由函数"""
    try:
        # 读取上传的文件和参数
        reader = await request.multipart()
        
        # 读取图片文件
        field = await reader.next()
        assert field.name == 'file'
        image_data = await field.read()
        
        # 读取其他参数
        field = await reader.next()
        assert field.name == 'text'
        text = (await field.read()).decode()
        
        field = await reader.next()
        assert field.name == 'opacity'
        opacity = float((await field.read()).decode())
        
        # 创建临时文件
        input_path = os.path.join(TEMP_DIR, f"input_{int(time.time())}.png")
        output_path = os.path.join(TEMP_DIR, f"output_{int(time.time())}.png")
        params_path = os.path.join(TEMP_DIR, f"params_{int(time.time())}.txt")
        
        try:
            # 保存上传的图片
            with open(input_path, 'wb') as f:
                f.write(image_data)
                
            # 保存水印参数
            with open(params_path, 'w', encoding='utf-8') as f:
                f.write(f"{text}\n")  # 水印文本
                f.write(f"{opacity}\n")  # 水印强度
            
            # 调用Julia脚本处理水印
            script_path = os.path.join(MWORKS_SCRIPTS_PATH, "watermark.jl")
            process = await asyncio.create_subprocess_exec(
                "julia", script_path, input_path, output_path, params_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"水印处理失败: {stderr.decode()}")
                raise Exception("水印处理失败")
                
            # 读取处理后的图片
            with open(output_path, 'rb') as f:
                result = f.read()
                
            # 返回图片数据，不手动设置CORS头
            return web.Response(
                body=result,
                content_type='image/png',
                headers={
                    'Content-Disposition': 'inline'
                }
            )
            
        finally:
            # 确保清理临时文件
            for path in [input_path, output_path, params_path]:
                try:
                    if os.path.exists(path):
                        os.remove(path)
                except Exception as e:
                    logger.error(f"清理临时文件失败: {str(e)}")
        
    except Exception as e:
        logger.error(f"处理水印请求时发生错误: {str(e)}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)

async def handle_chat(request):
    """处理聊天请求的路由函数"""
    try:
        data = await request.json()
        message = data.get('message', '')
        response = await chat_with_ai(message)
        return web.Response(text=response)
    except Exception as e:
        logger.error(f"处理聊天请求时发生错误: {str(e)}")
        return web.Response(status=500, text=str(e))

async def test(request):
    """测试路由处理函数"""
    return web.Response(text="服务器正常运行")

if __name__ == "__main__":
    try:
        # 环境检查
        logger.info("正在检查环境...")
        logger.info(f"临时目录: {TEMP_DIR}")
        logger.info(f"Julia脚本路径: {MWORKS_SCRIPTS_PATH}")
        logger.info(f"Watermark脚本: watermark.jl")
        logger.info("环境检查通过")

        # 创建Web应用
        app = web.Application()
        
        # 配置CORS
        cors = aiohttp_cors.setup(app, defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=False,
                expose_headers="*",
                allow_headers="*",
                allow_methods=["GET", "POST"]
            )
        })

        # 添加路由
        app.router.add_get('/test', test)
        app.router.add_post('/api/watermark', handle_watermark)
        app.router.add_post('/api/chat', handle_chat)
        
        # 应用CORS设置到路由
        for route in list(app.router.routes()):
            cors.add(route)
            
        # 添加静态文件服务
        app.router.add_static('/temp', TEMP_DIR)
        app.router.add_static('/static', 'static')
            
        # 启动服务器
        logger.info("尝试启动服务器...")
        logger.info("服务器将在 http://localhost:8000 上运行")
        web.run_app(app, host='127.0.0.1', port=8000)
        
    except Exception as e:
        logger.error(f"服务器启动失败: {str(e)}")
        logger.error(traceback.format_exc())
        input("按回车键退出...") 