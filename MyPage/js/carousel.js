// 轮播图类定义
class Carousel {
    // 构造函数，初始化轮播图组件
    constructor(element) {
        // 获取DOM元素
        this.carousel = element;                                   // 轮播图容器
        this.container = element.querySelector('.carousel-container'); // 图片容器
        this.slides = this.container.querySelectorAll('img');     // 所有图片
        this.prevBtn = element.querySelector('.prev');            // 上一张按钮
        this.nextBtn = element.querySelector('.next');            // 下一张按钮
        this.dotsContainer = element.querySelector('.carousel-dots'); // 指示点容器
        
        this.currentIndex = 0;                // 当前显示的图片索引
        this.autoPlayInterval = 5000;         // 自动播放间隔时间（5秒）
        this.isAnimating = false;             // 动画状态标记，防止动画过程中重复触发
        
        this.init();                          // 初始化轮播图
    }
    
    // 初始化方法
    init() {
        this.slides[0].classList.add('active');    // 显示第一张图片
        this.createDots();                         // 创建指示点
        this.bindEvents();                         // 绑定事件处理
        this.startAutoPlay();                      // 开始自动播放
        this.updateDots();                         // 更新指示点状态
    }
    
    createDots() {
        this.slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // 鼠标悬停时暂停自动播放
        this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // 添加触摸事件支持
        let startX, moveX;
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.carousel.addEventListener('touchmove', (e) => {
            moveX = e.touches[0].clientX;
        });
        
        this.carousel.addEventListener('touchend', () => {
            if (startX - moveX > 50) { // 向左滑动
                this.nextSlide();
            } else if (moveX - startX > 50) { // 向右滑动
                this.prevSlide();
            }
        });
    }
    
    goToSlide(index) {
        if (this.isAnimating) return;
        
        if (index === this.currentIndex) return;
        
        if (index > this.currentIndex) {
            this.nextSlide();
        } else {
            this.prevSlide();
        }
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const currentSlide = this.slides[this.currentIndex];
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        const prevSlide = this.slides[this.currentIndex];
        
        // 先将当前图片移到中间
        currentSlide.classList.remove('active');
        currentSlide.classList.add('next');
        
        // 将前一张图片放到左侧准备
        prevSlide.style.transition = 'none';
        prevSlide.classList.add('prev');
        
        // 强制重排
        void prevSlide.offsetWidth;
        
        // 恢复过渡效果
        prevSlide.style.transition = '';
        
        // 开始动画：当前图片向右移，新图片移到中间
        prevSlide.classList.remove('prev');
        prevSlide.classList.add('active');
        
        // 动画结束后清理类
        setTimeout(() => {
            currentSlide.classList.remove('next');
            currentSlide.style.transition = '';
            this.isAnimating = false;
        }, 500);
        
        this.updateDots();
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const currentSlide = this.slides[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        const nextSlide = this.slides[this.currentIndex];
        
        // 设置新的幻灯片位置
        nextSlide.classList.add('next');
        
        // 强制重排
        void nextSlide.offsetWidth;
        
        // 移除当前幻灯片的active类，添加prev类（向左移动）
        currentSlide.classList.remove('active');
        currentSlide.classList.add('prev');
        
        // 移除新幻灯片的next类，添加active类（从右边移入）
        nextSlide.classList.remove('next');
        nextSlide.classList.add('active');
        
        // 动画结束后清理类
        setTimeout(() => {
            currentSlide.classList.remove('prev');
            this.isAnimating = false;
        }, 500);
        
        this.updateDots();
    }
    
    updateSlidePosition() {
        // this.slides.forEach((slide, index) => {
        //     slide.classList.toggle('active', index === this.currentIndex);
        // });
    }
    
    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    startAutoPlay() {
        this.autoPlayTimer = setInterval(() => this.nextSlide(), this.autoPlayInterval);
    }
    
    stopAutoPlay() {
        clearInterval(this.autoPlayTimer);
    }
}

// 初始化轮播
document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = document.querySelector('.carousel');
    if (carouselElement) {
        new Carousel(carouselElement);
    }
}); 