# ADR: WebSocket 通信协议技术选型与规范

## 状态

**Accepted** — 已确认

**决策方案**：方案 B - 原生 WebSocket

**决策日期**：2026-02-02

**决策理由**：

1. ✅ 完全可控的协议设计
2. ✅ 性能最优，无额外封装开销
3. ✅ 轻量级，无额外依赖
4. ✅ 学习成本低，标准 WebSocket API
5. ✅ 适合项目需求，功能简单明确

## 关联

- **Design Doc**: #12 - [Design] WebSocket 通信协议与消息工厂
- **PRD**: #11 - [PRD] WebSocket 通信协议与消息工厂
- **Scope**: #10 - [Scope] WebSocket 通信协议与消息工厂（第一阶段）

## 背景

NodeMUD 项目需要建立前后端实时双向通信机制，用于：

1. 玩家登录注册流程
2. 游戏指令交互
3. 实时事件推送
4. 心跳保活

传统 MUD 游戏使用 Telnet 协议，但现代 Web/移动应用需要更适合的通信方案。需要确定：

- 使用什么通信协议
- 使用什么技术栈实现
- 如何保证类型安全
- 如何设计消息格式

## 决策驱动因素

### 1. 实时性要求

- ✅ 必须支持服务器主动推送（房间事件、战斗消息等）
- ✅ 延迟需控制在 100ms 以内
- ✅ 支持心跳检测

### 2. 技术栈兼容性

- ✅ 后端：NestJS (Node.js + TypeScript)
- ✅ 前端：React Native (TypeScript)
- ✅ 需要跨平台支持（iOS + Android）

### 3. 类型安全

- ✅ 前后端消息类型必须一致
- ✅ 编译时类型检查
- ✅ 避免运行时类型错误

### 4. 开发体验

- ✅ 团队对技术栈熟悉度
- ✅ 社区支持和文档完善
- ✅ 调试工具完善

### 5. 扩展性

- ✅ 易于添加新消息类型
- ✅ 支持后期优化（断线重连、消息队列等）
- ✅ 支持分布式部署（后期）

---

## 候选方案

### 方案 A: WebSocket + Socket.IO + TypeScript 类型共享

**技术栈**：

- 协议：WebSocket (Socket.IO 封装)
- 后端库：`@nestjs/websockets` + `socket.io`
- 前端库：`socket.io-client`
- 类型共享：Monorepo + `@packages/core`

**消息格式**：

```typescript
interface Message<T> {
  type: string;
  data: T;
  timestamp: number;
}
```

**优势**：

1. ✅ **自动重连**：Socket.IO 内置断线重连机制
2. ✅ **跨平台兼容**：支持浏览器、React Native、Node.js
3. ✅ **降级支持**：WebSocket 不可用时自动降级到长轮询
4. ✅ **房间机制**：内置 room 机制，适合 MUD 房间系统
5. ✅ **社区成熟**：文档完善，案例丰富
6. ✅ **NestJS 集成**：`@nestjs/websockets` 官方支持
7. ✅ **事件机制**：基于事件的消息分发，易于扩展

**劣势**：

1. ❌ **包体积大**：Socket.IO 客户端约 60KB（gzip 后 20KB）
2. ❌ **协议开销**：比原生 WebSocket 多一层封装
3. ❌ **学习曲线**：需要理解 Socket.IO 的事件机制

**适用场景**：

- 需要可靠连接和自动重连
- 需要房间/广播等高级功能
- 团队熟悉 Socket.IO

---

### 方案 B: 原生 WebSocket + 自定义协议 + TypeScript 类型共享

**技术栈**：

- 协议：原生 WebSocket
- 后端库：`ws` 库（NestJS Adapter）
- 前端库：原生 WebSocket API
- 类型共享：Monorepo + `@packages/core`

**消息格式**：

```typescript
interface Message<T> {
  type: string;
  data: T;
  timestamp: number;
}
```

**优势**：

1. ✅ **轻量级**：无额外依赖，包体积最小
2. ✅ **性能最优**：无协议封装开销
3. ✅ **原生支持**：浏览器和 React Native 原生支持
4. ✅ **完全可控**：协议细节完全自主设计
5. ✅ **学习成本低**：标准 WebSocket API

**劣势**：

1. ❌ **需要自己实现重连**：断线重连机制需手动开发
2. ❌ **需要自己实现心跳**：需手动实现 ping/pong 机制
3. ❌ **无房间机制**：需手动管理房间/广播逻辑
4. ❌ **调试工具少**：相比 Socket.IO 调试工具少

**适用场景**：

- 对性能和包体积敏感
- 需要完全自主可控的协议
- 功能需求简单，不需要复杂特性

---

### 方案 C: HTTP Long Polling + REST API

**技术栈**：

- 协议：HTTP/1.1 Long Polling
- 后端库：NestJS 标准 REST API
- 前端库：`fetch` + 轮询

**消息格式**：

```json
{
  "type": "message",
  "data": {...}
}
```

**优势**：

1. ✅ **兼容性最好**：任何环境都支持 HTTP
2. ✅ **简单直观**：标准 REST API，易于理解
3. ✅ **调试方便**：可以直接用浏览器/Postman 测试

**劣势**：

1. ❌ **延迟高**：轮询间隔导致延迟至少 1-2 秒
2. ❌ **服务器压力大**：大量轮询请求占用资源
3. ❌ **不支持服务器推送**：需要客户端主动拉取
4. ❌ **不适合实时游戏**：延迟过高，体验差

**适用场景**：

- 非实时应用
- 需要极高兼容性的场景
- **不适合 MUD 游戏**

---

## 对比

| 维度            | Socket.IO                     | 原生 WebSocket            | HTTP Long Polling          |
| --------------- | ----------------------------- | ------------------------- | -------------------------- |
| **实时性**      | ⭐⭐⭐⭐⭐ 优秀               | ⭐⭐⭐⭐⭐ 优秀           | ⭐⭐ 差（1-2s 延迟）       |
| **性能**        | ⭐⭐⭐⭐ 良好                 | ⭐⭐⭐⭐⭐ 最优           | ⭐⭐ 差（高并发压力大）    |
| **包体积**      | ⭐⭐⭐ 中等（60KB）           | ⭐⭐⭐⭐⭐ 最小（0KB）    | ⭐⭐⭐⭐ 小                |
| **开发效率**    | ⭐⭐⭐⭐⭐ 最高（内置特性多） | ⭐⭐⭐ 中等（需自己实现） | ⭐⭐⭐⭐ 高（标准 API）    |
| **可靠性**      | ⭐⭐⭐⭐⭐ 最高（自动重连）   | ⭐⭐⭐ 中等（需手动实现） | ⭐⭐⭐⭐ 高（HTTP 可靠）   |
| **扩展性**      | ⭐⭐⭐⭐⭐ 优秀（房间/广播）  | ⭐⭐⭐ 中等（需手动实现） | ⭐⭐ 差                    |
| **调试工具**    | ⭐⭐⭐⭐⭐ 丰富               | ⭐⭐⭐ 一般               | ⭐⭐⭐⭐ 丰富（HTTP 工具） |
| **学习成本**    | ⭐⭐⭐⭐ 低                   | ⭐⭐⭐⭐⭐ 最低           | ⭐⭐⭐⭐⭐ 最低            |
| **NestJS 集成** | ⭐⭐⭐⭐⭐ 官方支持           | ⭐⭐⭐⭐ 社区支持         | ⭐⭐⭐⭐⭐ 原生支持        |
| **适合 MUD**    | ⭐⭐⭐⭐⭐ 非常适合           | ⭐⭐⭐⭐ 适合             | ⭐ 不适合                  |

---

## 建议

### 推荐方案：**方案 A - Socket.IO**

**核心理由**：

1. ✅ **MUD 游戏特性匹配**：房间系统天然适配 Socket.IO 的 room 机制
2. ✅ **开发效率优先**：自动重连、心跳检测开箱即用，节省开发时间
3. ✅ **可靠性优先**：MUD 游戏需要稳定连接，Socket.IO 的自动重连至关重要
4. ✅ **NestJS 官方支持**：`@nestjs/websockets` 深度集成，代码简洁
5. ✅ **后期扩展容易**：房间广播、私聊、世界频道等功能易于实现

**具体实施方案**：

#### 1. Monorepo 类型共享

```
packages/core/
└─ src/
   ├─ types/
   │  ├─ base.ts           # BaseMessage, ClientMessage, ServerMessage
   │  └─ messages/
   │     ├─ auth.ts        # 登录注册消息
   │     ├─ ping.ts        # 心跳消息
   │     └─ ui.ts          # UI 提示消息
   └─ factory/
      └─ MessageFactory.ts # 消息工厂（创建、验证、序列化）
```

#### 2. 后端实现

```typescript
// server/src/websocket/websocket.gateway.ts

@WebSocketGateway(4000, { cors: true })
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('连接:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    const message = MessageFactory.deserialize(data);
    // 路由到对应处理器
  }
}
```

#### 3. 前端实现

```typescript
// client/src/services/WebSocketService.ts

import io from 'socket.io-client';
import { MessageFactory } from '@packages/core';

class WebSocketService {
  private socket: Socket | null = null;

  connect(url: string) {
    this.socket = io(url, {
      reconnection: true, // 自动重连
      reconnectionDelay: 1000, // 重连延迟
      reconnectionAttempts: 5, // 重连次数
    });

    this.socket.on('message', (data) => {
      const message = MessageFactory.deserialize(data);
      // 分发消息
    });
  }
}
```

#### 4. 消息格式规范

```typescript
// 所有消息遵循统一格式
interface Message<T> {
  type: string;        // 消息类型（如 'login', 'roomDescription'）
  data: T;             // 消息数据
  timestamp: number;   // 时间戳（毫秒）
}

// 示例
{
  type: 'login',
  data: { username: 'player1', password: '123456' },
  timestamp: 1706889600000
}
```

---

## 为什么不选其他方案

### 为什么不选原生 WebSocket（方案 B）

虽然性能最优，但：

1. ❌ **开发成本高**：需要手动实现重连、心跳、房间等功能
2. ❌ **维护成本高**：这些功能需要持续维护和测试
3. ❌ **时间成本**：P0 紧急任务，需要快速上线
4. ❌ **收益有限**：性能差异对 MUD 游戏可忽略（非大型 MMO）

**适用场景**：

- 大型高并发 MMO 游戏（每秒数万消息）
- 需要极致性能优化的场景
- 团队有足够时间开发基础设施

**当前项目不适用**：

- NodeMUD 是小型文字游戏，并发量有限
- P0 优先级，需要快速上线
- 团队规模小，基础设施开发成本高

### 为什么不选 HTTP Long Polling（方案 C）

1. ❌ **延迟过高**：1-2 秒延迟无法满足 MUD 实时交互需求
2. ❌ **不支持服务器推送**：房间事件、战斗消息无法实时推送
3. ❌ **资源浪费**：大量轮询请求占用服务器资源
4. ❌ **用户体验差**：玩家输入指令后需等待 1-2 秒才能看到响应

**完全不适合 MUD 游戏场景。**

---

## 影响

### 对现有代码

- ✅ **无影响**：全新模块，不修改现有代码
- ✅ **新增依赖**：
  - 后端：`@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
  - 前端：`socket.io-client`
  - 共享：`@packages/core`

### 对后续开发

- ✅ **加速开发**：房间系统、聊天系统、战斗系统可直接使用 Socket.IO 的 room 和广播机制
- ✅ **降低复杂度**：不需要维护重连、心跳等基础设施代码
- ✅ **提升可靠性**：成熟的 Socket.IO 库经过大规模生产验证

### 迁移成本

- ✅ **无迁移成本**：新项目，无历史包袱
- ⚠️ **后期迁移**：如果未来需要迁移到原生 WebSocket，需要：
  1. 重写连接管理逻辑
  2. 实现断线重连机制
  3. 实现心跳检测
  4. 重构房间/广播逻辑

  **预估工作量**：2-3 周

  **是否值得**：除非遇到性能瓶颈（万级并发），否则不建议迁移

---

## 技术规范

### 1. 消息命名规范

- ✅ 使用小写 + 驼峰：`login`, `registerSuccess`, `roomDescription`
- ✅ 动词优先：`createCharacter`, `attackMonster`
- ✅ 响应消息添加后缀：`Success` / `Failed`

### 2. 类型定义规范

- ✅ 所有消息类型定义在 `packages/core/src/types/messages/`
- ✅ 按模块拆分文件：`auth.ts`, `room.ts`, `combat.ts`
- ✅ 导出接口使用 `Message` 后缀：`LoginMessage`, `RoomDescriptionMessage`

### 3. 消息工厂规范

- ✅ 使用装饰器注册：`@MessageHandler('login')`
- ✅ 实现 `IMessageHandler` 接口
- ✅ `create()` 方法负责创建消息
- ✅ `validate()` 方法负责验证消息格式

### 4. 错误处理规范

- ✅ 无效消息记录日志并丢弃
- ✅ 未认证用户只能发送 `login`, `register`, `ping`
- ✅ 错误消息统一返回 `{type}Failed` 格式

---

## 决策时间线

- **2026-02-02**：提出决策需求
- **2026-02-02**：方案对比分析
- **待定**：团队评审和最终决策

---

## 参考资料

- [Socket.IO 官方文档](https://socket.io/docs/v4/)
- [NestJS WebSocket 文档](https://docs.nestjs.com/websockets/gateways)
- [WebSocket MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

> CX 工作流 | ADR | Design Doc #12
> 下一步：团队评审后更新状态为 Accepted
