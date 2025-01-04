using Images
using FFTW

function add_watermark(image_path, output_path, text, opacity)
    # 将 opacity 转换为浮点数
    opacity_float = parse(Float64, opacity)
    
    # 读取原始图片
    img = load(image_path)
    
    # 分别处理每个颜色通道
    channels = channelview(float.(RGBA.(img)))
    watermarked_channels = similar(channels)
    
    # 处理RGB通道
    for i in 1:3  # RGB三个通道
        channel = channels[i, :, :]
        
        # 应用DCT变换
        dct_img = dct(channel)
        
        # 生成水印
        watermark = zeros(size(dct_img))
        # 将文本转换为Unicode码点
        text_values = [Int(c) % 255 for c in text]  # 对Unicode码点取模以限制范围
        
        # 计算合适的水印强度
        max_coeff = maximum(abs.(dct_img))
        strength = opacity_float * max_coeff * 0.01  # 使用转换后的浮点数
        
        # 在中频区域嵌入水印
        height, width = size(dct_img)
        mid_h = height ÷ 3
        mid_w = width ÷ 3
        
        for (j, val) in enumerate(text_values)
            if j <= min(mid_h, mid_w)
                normalized_val = (val / 255.0) * strength
                
                # 对角线位置
                watermark[mid_h+j, mid_w+j] = normalized_val
                watermark[mid_h-j, mid_w-j] = normalized_val
                
                # 十字形位置
                watermark[mid_h+j, mid_w] = normalized_val
                watermark[mid_h-j, mid_w] = normalized_val
                watermark[mid_h, mid_w+j] = normalized_val
                watermark[mid_h, mid_w-j] = normalized_val
            end
        end
        
        # 添加水印
        watermarked_dct = dct_img + watermark
        
        # 逆DCT变换
        watermarked_channels[i, :, :] = idct(watermarked_dct)
    end
    
    # 保持原始alpha通道不变
    watermarked_channels[4, :, :] = channels[4, :, :]
    
    # 限制像素值范围并保存
    watermarked_img = colorview(RGBA, clamp.(watermarked_channels, 0.0, 1.0))
    save(output_path, watermarked_img)
end

# 主程序
function main()
    if length(ARGS) != 3
        println("Usage: julia watermark.jl input_path output_path params_path")
        exit(1)
    end
    
    input_path, output_path, params_path = ARGS
    
    # 读取参数
    params = readlines(params_path)
    text = params[1]
    opacity = params[2]
    
    # 添加水印
    add_watermark(input_path, output_path, text, opacity)
end

main() 