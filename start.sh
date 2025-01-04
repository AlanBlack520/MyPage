#!/bin/bash
# 启动 Python 后端
python3 app.py &

# 重启 Nginx
sudo systemctl restart nginx 