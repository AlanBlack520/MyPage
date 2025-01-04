// Matrix数字雨效果类
class MatrixRain {
    // 构造函数，初始化Matrix效果
    constructor() {
        // 获取canvas元素和上下文
        this.canvas = document.getElementById('matrix');
        this.ctx = this.canvas.getContext('2d');
        
        // 基础配置参数
        this.fontSize = 16;                        // 字体大小
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';  // 显示的字符集
        this.maxColumns = 500;                     // 最大列数限制
        
        // 动画控制参数
        this.lastTime = 0;                         // 上一帧时间戳
        this.dropSpeed = 20;                       // 下落速度（每秒20像素）
        this.accumulator = 0;                      // 时间累加器
        
        // 随机初始位置
        this.initDrops = () => {
            const drops = new Array(this.columns);
            for (let i = 0; i < this.columns; i++) {
                drops[i] = Math.random() * -100; // 随机负值，使初始位置分散
            }
            return drops;
        };
        
        // 设置canvas尺寸为窗口大小
        this.columns = 0;
        this.drops = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 设置字体
        this.ctx.font = `bold ${this.fontSize}px monospace`;
        
        this.animate();
    }
    
    resize() {
        try {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // 限制列数，防止数组过大
            let calculatedColumns = Math.floor(this.canvas.width / this.fontSize);
            this.columns = Math.min(Math.max(1, calculatedColumns), this.maxColumns);
            
            // 创建新数组
            this.drops = this.initDrops();
        } catch (error) {
            console.error('Error in resize:', error);
            // 设置默认值
            this.columns = 100;
            this.drops = this.initDrops();
        }
    }
    
    draw(deltaTime) {
        // 累加时间
        this.accumulator += deltaTime;
        
        // 计算这一帧是否需要移动
        const moveStep = this.dropSpeed * deltaTime / 1000;
        
        // 设置半透明背景，产生拖尾效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // 减小透明度，使拖尾更长
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置文字颜色
        this.ctx.fillStyle = '#00ff9d';
        
        // 绘制字符
        if (!this.drops || !this.drops.length) return;
        
        for(let i = 0; i < this.drops.length; i++) {
            const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            const y = this.drops[i] * this.fontSize;
            
            // 只绘制在视图内的字符
            if (y > 0 && y < this.canvas.height) {
                this.ctx.fillText(text, i * this.fontSize, y);
            }
            
            // 如果达到底部或随机位置，重置到顶部
            if(y > this.canvas.height) {
                this.drops[i] = Math.random() * -10; // 重置到稍微随机的负值位置
            }
            
            this.drops[i] += moveStep;
        }
    }
    
    animate(currentTime = 0) {
        // 计算时间差
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.draw(deltaTime);
        requestAnimationFrame((time) => this.animate(time));
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new MatrixRain();
}); 