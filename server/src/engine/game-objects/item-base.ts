/**
 * ItemBase — 物品基类
 *
 * 所有游戏物品的基类，继承 BaseEntity。
 * 提供物品通用属性访问方法：名称、描述、类型、重量、价值、堆叠等。
 */
import { BaseEntity } from '../base-entity';
import type { LivingBase } from './living-base';

/** 物品动作定义（用于前端渲染按钮 + 执行指令） */
export interface ItemActionDefinition {
  /** 按钮文案 */
  label: string;
  /** 点击按钮时发送的指令 */
  command: string;
}

export class ItemBase extends BaseEntity {
  /** 物品可克隆（非虚拟） */
  static virtual = false;

  /** 获取物品名字 */
  getName(): string {
    return this.get<string>('name') ?? '未知物品';
  }

  /** 获取简短描述 */
  getShort(): string {
    return this.get<string>('short') ?? this.getName();
  }

  /** 获取详细描述 */
  getLong(): string {
    return this.get<string>('long') ?? `这是一个${this.getName()}。`;
  }

  /** 获取物品类型 */
  getType(): string {
    return this.get<string>('type') ?? 'misc';
  }

  /** 获取重量 */
  getWeight(): number {
    return this.get<number>('weight') ?? 0;
  }

  /** 获取价值 */
  getValue(): number {
    return this.get<number>('value') ?? 0;
  }

  /** 是否可堆叠 */
  isStackable(): boolean {
    return this.get<boolean>('stackable') ?? false;
  }

  /** 是否可交易 */
  isTradeable(): boolean {
    return this.get<boolean>('tradeable') ?? true;
  }

  /** 是否可丢弃 */
  isDroppable(): boolean {
    return this.get<boolean>('droppable') ?? true;
  }

  /** 是否唯一物品 */
  isUnique(): boolean {
    return this.get<boolean>('unique') ?? false;
  }

  /** 获取等级需求 */
  getLevelReq(): number {
    return this.get<number>('level_req') ?? 0;
  }

  /** 获取当前耐久度 */
  getDurability(): number {
    return this.get<number>('durability') ?? -1;
  }

  /** 获取最大耐久度 */
  getMaxDurability(): number {
    return this.get<number>('max_durability') ?? -1;
  }

  /** 获取品质（默认 COMMON = 0） */
  getQuality(): number {
    return this.get<number>('quality') ?? 0;
  }

  /**
   * 获取物品可用动作定义（子类/蓝图可 override）
   * - 旧协议兼容: getActions() 仍返回 label 列表
   * - 新协议扩展: getActionCommands() 返回 label -> command 映射
   */
  getActionDefinitions(_owner?: LivingBase): ItemActionDefinition[] {
    const defs: ItemActionDefinition[] = [
      {
        label: '查看',
        command: `look ${this.getName()}`,
      },
    ];
    if (this.isDroppable()) {
      defs.push({
        label: '丢弃',
        command: `drop ${this.getName()}`,
      });
    }
    return defs;
  }

  /** 兼容旧接口：仅返回动作文案 */
  getActions(owner?: LivingBase): string[] {
    return this.getActionDefinitions(owner).map((def) => def.label);
  }

  /** 新接口：返回动作文案到指令的映射 */
  getActionCommands(owner?: LivingBase): Record<string, string> {
    const defs = this.getActionDefinitions(owner);
    const mapping: Record<string, string> = {};
    for (const def of defs) {
      mapping[def.label] = def.command;
    }
    return mapping;
  }

  /** 物品不在任何容器中 → 可清理 */
  public onCleanUp(): boolean {
    if (!this.getEnvironment()) return true;
    return false;
  }
}
