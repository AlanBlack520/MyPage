// 获取DOM元素
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const newChatBtn = document.getElementById('newChatBtn');

// API Key
const API_KEY = 'b9c4bfc1d194480a8500dd2c9b904e21.Uoi5rPFG2KoQqf8f';

// 从 sessionStorage 恢复聊天记录
function restoreMessages() {
    const savedMessages = sessionStorage.getItem('chatMessages');
    const hasVisited = sessionStorage.getItem('hasVisited');
    
    if (!hasVisited) {
        // 第一次访问，显示欢迎消息
        sessionStorage.setItem('hasVisited', 'true');
        newChat();
    } else if (savedMessages) {
        // 非第一次访问且有聊天记录，恢复记录
        chatMessages.innerHTML = savedMessages;
    } else {
        // 非第一次访问但无聊天记录，显示欢迎消息
        newChat();
    }
}

// 保存消息到 sessionStorage
function saveMessages() {
    sessionStorage.setItem('chatMessages', chatMessages.innerHTML);
}

// 发送消息函数
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 清空输入框
    userInput.value = '';

    // 添加用户消息到聊天界面
    appendMessage('user', message);

    // 显示打字指示器
    typingIndicator.style.display = 'flex';

    try {
        // 发送请求到智谱AI
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "glm-4",
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 隐藏打字指示器
        typingIndicator.style.display = 'none';

        // 添加AI回复到聊天界面
        if (data.choices && data.choices[0] && data.choices[0].message) {
            appendMessage('bot', data.choices[0].message.content);
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.style.display = 'none';
        appendMessage('bot', '抱歉，出现了一些问题，请稍后再试。');
    }
}

// 添加消息到聊天界面
function appendMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 保存到 sessionStorage
    saveMessages();
}

// 新建对话
function newChat() {
    chatMessages.innerHTML = `
        <div class="message bot">
            <div class="message-content">
                你好！我是 AI 助手，有什么我可以帮你的吗？
            </div>
        </div>
    `;
    // 保存初始消息
    saveMessages();
}

// 事件监听
newChatBtn.addEventListener('click', newChat);

// 页面加载时恢复聊天记录
document.addEventListener('DOMContentLoaded', () => {
    restoreMessages();
});

// 将 sendMessage 函数添加到全局作用域
window.sendMessage = sendMessage; 