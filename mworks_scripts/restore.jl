using Images
using FFTW

function restore_image(input_path, output_path)
    # 读取带水印的图片
    img = load(input_path)
    
    # 分别处理每个颜色通道
    channels = channelview(float.(RGBA.(img)))
    restored_channels = similar(channels)
    
    # 处理RGB通道
    for i in 1:3  # RGB三个通道
        channel = channels[i, :, :]
        
        # 应用DCT变换
        dct_img = dct(channel)
        
        # 清除水印（中频区域）
        height, width = size(dct_img)
        mid_h = height ÷ 3
        mid_w = width ÷ 3
        
        # 保存原始系数的副本
        original_dct = copy(dct_img)
        
        # 清除水印区域
        for j in 1:min(mid_h, mid_w)
            # 确保索引在有效范围内
            if mid_h+j <= height && mid_w+j <= width
                # 使用平滑过渡而不是直接置零
                dct_img[mid_h+j, mid_w+j] = original_dct[mid_h+j, mid_w+j] * 0.8
            end
            if mid_h-j+1 > 0 && mid_w-j+1 > 0
                dct_img[mid_h-j+1, mid_w-j+1] = original_dct[mid_h-j+1, mid_w-j+1] * 0.8
            end
            if mid_h+j <= height
                dct_img[mid_h+j, mid_w] = original_dct[mid_h+j, mid_w] * 0.8
            end
            if mid_h-j+1 > 0
                dct_img[mid_h-j+1, mid_w] = original_dct[mid_h-j+1, mid_w] * 0.8
            end
            if mid_w+j <= width
                dct_img[mid_h, mid_w+j] = original_dct[mid_h, mid_w+j] * 0.8
            end
            if mid_w-j+1 > 0
                dct_img[mid_h, mid_w-j+1] = original_dct[mid_h, mid_w-j+1] * 0.8
            end
        end
        
        # 逆DCT变换
        restored_channels[i, :, :] = idct(dct_img)
    end
    
    # 保持原始alpha通道不变
    restored_channels[4, :, :] = channels[4, :, :]
    
    # 限制像素值范围并保存
    restored_img = colorview(RGBA, clamp.(restored_channels, 0.0, 1.0))
    save(output_path, restored_img)
end

# 主函数
function main()
    if length(ARGS) != 2
        println("Usage: julia restore.jl input_path output_path")
        exit(1)
    end
    
    input_path = ARGS[1]
    output_path = ARGS[2]
    
    restore_image(input_path, output_path)
end

main() 