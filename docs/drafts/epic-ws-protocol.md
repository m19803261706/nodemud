## 功能概述

建立 NodeMUD 项目的前后端通信基础设施,实现基于 WebSocket 的实时双向通信协议和类型安全的消息工厂系统。

**技术决策**: 采用原生 WebSocket (ADR #13)

## 相关文档

- **PRD**: #11 - [PRD] WebSocket 通信协议与消息工厂
- **Design Doc**: #12 - [Design] WebSocket 通信协议与消息工厂
- **ADR**: #13 - WebSocket 通信协议技术选型

## 任务进度

### Phase 1: 基础设施搭建

- [ ] #TBD 创建 packages/core 共享包
- [ ] #TBD 定义消息类型（auth/ping/ui）
- [ ] #TBD 实现消息工厂（自动扫包注册）

### Phase 2: 后端实现

- [ ] #TBD 数据库表设计与 Entity
- [ ] #TBD Account Service（注册/登录）
- [ ] #TBD WebSocket Gateway
- [ ] #TBD 消息处理器（auth/ping）

### Phase 3: 前端实现

- [ ] #TBD WebSocket Service
- [ ] #TBD 登录页面
- [ ] #TBD 注册页面
- [ ] #TBD 占位符页面（游戏主页/创建角色）

### Phase 4: 集成测试

- [ ] #TBD 端到端测试（注册/登录/心跳）
- [ ] #TBD Bug 修复与优化

---

**进度**: 0/12
**优先级**: P0 紧急
**预计工期**: 2-3 周

---

> CX 工作流 | Epic
