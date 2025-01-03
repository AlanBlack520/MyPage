// 获取DOM元素
const imageInput = document.getElementById('imageInput');
const originalImage = document.getElementById('originalImage');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const watermarkedImage = document.getElementById('watermarkedImage');
const watermarkText = document.getElementById('watermarkText');
const strengthSlider = document.getElementById('watermarkStrength');
const strengthValue = document.getElementById('strengthValue');
const generateBtn = document.getElementById('generateWatermark');
const downloadBtn = document.getElementById('downloadBtn');

// 处理图片预览
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        // 保存到 sessionStorage
        sessionStorage.setItem('hasUploaded', 'true');
        sessionStorage.setItem('previewImage', imageUrl);
        
        // 显示预览图
        const originalImage = document.getElementById('originalImage');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        
        originalImage.src = imageUrl;
        originalImage.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// 监听文本框输入，实时保存
function initWatermarkText() {
    watermarkText.addEventListener('input', function() {
        const text = this.value;
        if (text) {
            sessionStorage.setItem('hasWatermarkText', 'true');
            sessionStorage.setItem('watermarkText', text);
        }
    });
}

// 页面加载时恢复预览图和水印文本
document.addEventListener('DOMContentLoaded', () => {
    // 恢复预览图
    const hasUploaded = sessionStorage.getItem('hasUploaded');
    if (hasUploaded === 'true') {
        const savedImage = sessionStorage.getItem('previewImage');
        if (savedImage) {
            const originalImage = document.getElementById('originalImage');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            
            originalImage.src = savedImage;
            originalImage.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
        }
    }

    // 恢复水印文本
    const hasWatermarkText = sessionStorage.getItem('hasWatermarkText');
    if (hasWatermarkText === 'true') {
        const savedText = sessionStorage.getItem('watermarkText');
        if (savedText) {
            watermarkText.value = savedText;
        }
    }

    // 初始化文本框监听
    initWatermarkText();
});

// 处理图片上传
function initImageUpload() {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.querySelector('.upload-area');

    // 点击上传
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            previewImage(file);
        }
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            imageInput.files = e.dataTransfer.files;
            previewImage(file);
        }
    });
}

// 初始化
initImageUpload();

// 显示进度对话框
function showProgress() {
    const dialog = document.getElementById('progressDialog');
    const fill = dialog.querySelector('.progress-fill');
    const text = document.getElementById('progressText');
    
    dialog.style.display = 'flex';
    fill.style.width = '0%';
    text.textContent = '处理中...';
    
    return {
        update: (percent, message) => {
            fill.style.width = `${percent}%`;
            if (message) text.textContent = message;
        },
        hide: () => {
            dialog.style.display = 'none';
        }
    };
}

// 处理水印生成
async function generateWatermark() {
    try {
        // 获取图片数据，优先从 sessionStorage 获取
        let file = imageInput.files[0];
        const savedImage = sessionStorage.getItem('previewImage');
        
        // 如果没有选择文件但有保存的图片，将 base64 转换为文件
        if (!file && savedImage) {
            const response = await fetch(savedImage);
            const blob = await response.blob();
            file = new File([blob], 'image.png', { type: 'image/png' });
        }

        const text = watermarkText.value;
        const strength = parseFloat(strengthSlider.value);

        if (!file && !savedImage) {
            alert('请选择图片');
            return;
        }
        if (!text) {
            alert('请输入水印文本');
            return;
        }

        // 显示进度
        const progress = showProgress();
        progress.update(20, '准备处理...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('text', text);
        formData.append('opacity', strength);

        progress.update(40, '正在上传...');

        const response = await fetch('http://localhost:8000/api/watermark', {
            method: 'POST',
            body: formData
        });

        progress.update(80, '处理中...');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        progress.update(100, '完成！');
        setTimeout(() => progress.hide(), 500);

        // 显示水印图片
        watermarkedImage.src = imageUrl;
        watermarkedImage.style.display = 'block';
        downloadBtn.style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        alert('处理图片时出错，请重试');
    }
}

// 处理图片下载
function downloadImage() {
    if (watermarkedImage.src) {
        const link = document.createElement('a');
        link.href = watermarkedImage.src;
        link.download = 'watermarked_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 初始化事件监听
function initEventListeners() {
    // 初始化图片上传
    initImageUpload();

    // 监听强度滑块变化
    strengthSlider.addEventListener('input', function() {
        strengthValue.textContent = this.value;
    });

    // 监听生成按钮点击
    generateBtn.addEventListener('click', generateWatermark);

    // 监听下载按钮点击
    downloadBtn.addEventListener('click', downloadImage);
}

// 启动应用
initEventListeners(); 