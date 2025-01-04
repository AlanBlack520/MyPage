# WatermarkProject 模块定义
module WatermarkProject

# 导入必要的包
using Images        # 用于图像处理 
using FFTW         # 用于DCT变换

# 导出 watermark 函数供外部使用
export watermark

# 包含主要的水印处理函数
include("../watermark.jl")  # 导入水印处理的具体实现

end  # 模块结束 