/**
 * 消息工厂导出入口
 * 自动导入所有处理器
 */

// 导入所有处理器（自动注册）
import './handlers/login';
import './handlers/register';
import './handlers/ping';

// 导出工厂类
export { MessageFactory, MessageHandler, type IMessageHandler } from './MessageFactory';
