/**
 * BlueprintMeta -- 蓝图元数据接口
 *
 * 描述一个已加载蓝图的元信息，由 BlueprintRegistry 管理。
 * 注意：此文件可能由并行任务 #58 创建，如有冲突以 #58 版本为准。
 */
import type { BaseEntity } from '../base-entity';

export interface BlueprintMeta {
  /** 蓝图唯一 ID（路径式，如 "room/yangzhou/inn"） */
  id: string;
  /** 蓝图文件路径 */
  filePath: string;
  /** 蓝图构造类 */
  blueprintClass: new (id: string) => BaseEntity;
  /** 是否为虚拟蓝图（不可直接实例化） */
  virtual: boolean;
}
