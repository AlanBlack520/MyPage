using Images
using FFTW

function add_watermark(image_path, output_path, text, opacity)
    # 读取原始图片并转换为灰度图
    img = load(image_path)
    gray_img = Gray.(img)
    
    # 转换为浮点数组
    img_array = Float64.(gray_img)
    
    # 应用DCT变换
    dct_img = dct(img_array)
    
    # 生成水印（使用文本的ASCII值）
    watermark = zeros(size(dct_img))
    text_values = Int.(collect(text))
    
    # 在中频区域嵌入水印
    mid_freq = size(dct_img, 1) ÷ 4
    for (i, val) in enumerate(text_values)
        if i <= mid_freq
            watermark[mid_freq+i, mid_freq+i] = val * opacity
        end
    end
    
    # 添加水印
    watermarked_dct = dct_img + watermark
    
    # 逆DCT变换
    watermarked_img = idct(watermarked_dct)
    
    # 归一化并保存
    watermarked_img = (watermarked_img .- minimum(watermarked_img)) ./ 
                      (maximum(watermarked_img) - minimum(watermarked_img))
    save(output_path, Gray.(watermarked_img))
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
    opacity = parse(Float64, params[2])
    
    # 添加水印
    add_watermark(input_path, output_path, text, opacity)
end

main() 