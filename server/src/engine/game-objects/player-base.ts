/**
 * PlayerBase - 玩家基类
 *
 * 所有玩家对象的基类，继承 LivingBase。
 * 绑定 WebSocket Session，提供消息发送、连接管理、权限等能力。
 *
 * 对标: LPC user.c / 炎黄 USER
 */
import { LivingBase } from './living-base';
import { Permission } from '../types/command';

export class PlayerBase extends LivingBase {
  /** 玩家可克隆（非虚拟对象） */
  static virtual = false;

  /** WebSocket 发送回调 */
  private _sendCallback: ((data: any) => void) | null = null;

  /** 绑定连接（玩家上线时调用） */
  bindConnection(sendCallback: (data: any) => void): void {
    this._sendCallback = sendCallback;
  }

  /** 解绑连接（玩家下线时调用） */
  unbindConnection(): void {
    this._sendCallback = null;
  }

  /** 是否在线 */
  isConnected(): boolean {
    return this._sendCallback !== null;
  }

  /** 向客户端发送数据 */
  sendToClient(data: any): void {
    if (this._sendCallback) {
      this._sendCallback(data);
    }
  }

  /** 接收消息（覆写 LivingBase，转发到客户端） */
  receiveMessage(msg: string): void {
    this.sendToClient({ type: 'message', data: { content: msg } });
  }

  /** 获取权限等级（覆写 LivingBase，默认 PLAYER） */
  getPermission(): Permission {
    return this.get<number>('permission') ?? Permission.PLAYER;
  }

  /** 玩家永不自毁（生命周期由连接管理） */
  public onCleanUp(): boolean {
    return false;
  }
}
