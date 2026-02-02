/**
 * BlueprintMeta — 蓝图元数据
 * 描述一个已加载蓝图的完整信息
 */
import type { BaseEntity } from '../base-entity';

/** 蓝图元数据 */
export interface BlueprintMeta {
  /** 蓝图 ID（路径推断，如 "area/yangzhou/inn"） */
  id: string;

  /** 编译后的 .js 文件绝对路径 */
  filePath: string;

  /** 蓝图类引用（BaseEntity 的子类构造函数） */
  blueprintClass: new (id: string) => BaseEntity;

  /** 是否虚拟对象（true=单例，false=可克隆） */
  virtual: boolean;

  /** 虚拟对象的单例实例引用（仅 virtual=true 时有值） */
  instance?: BaseEntity;
}
