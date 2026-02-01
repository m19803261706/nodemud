#!/bin/bash
# 后端启动测试脚本

cd /Users/cx/Documents/code/nextjs/renzaiGame/server

echo "启动服务器..."
pnpm run start:dev > startup.log 2>&1 &
PID=$!

echo "进程 PID: $PID"
echo "等待 8 秒让服务器启动..."
sleep 8

echo "测试健康检查接口..."
curl -s http://localhost:4000/health || echo "接口访问失败"

echo ""
echo "停止服务器..."
kill $PID 2>/dev/null

echo "完成"
