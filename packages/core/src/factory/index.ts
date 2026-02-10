/**
 * 消息工厂导出入口
 * 自动导入所有处理器
 */

// 导入所有处理器（自动注册）
// 客户端消息
import './handlers/login';
import './handlers/register';
import './handlers/ping';
// 服务端消息
import './handlers/loginSuccess';
// 角色创建消息
import './handlers/createCharacterStep1';
import './handlers/createCharacterFate';
import './handlers/createCharacterConfirm';
import './handlers/createCharacterSuccess';
import './handlers/createCharacterFailed';
import './handlers/loginFailed';
import './handlers/registerSuccess';
import './handlers/registerFailed';
import './handlers/toast';
import './handlers/alert';
// 房间信息消息
import './handlers/roomInfo';
// 玩家属性消息
import './handlers/playerStats';
// 物品/背包消息
import './handlers/inventoryUpdate';
import './handlers/equipmentUpdate';
// 战斗消息
import './handlers/combatStart';
import './handlers/combatUpdate';
import './handlers/combatEnd';
// 任务系统消息
import './handlers/questUpdate';
import './handlers/questAccept';
import './handlers/questAbandon';
import './handlers/questComplete';
import './handlers/allocatePoints';

// 导出工厂类
export { MessageFactory, MessageHandler, type IMessageHandler } from './MessageFactory';
