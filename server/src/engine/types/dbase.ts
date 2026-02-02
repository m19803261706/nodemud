/**
 * 蓝图接口
 * 蓝图是对象的模板定义，实例从蓝图创建
 */
export interface Blueprint {
  /** 蓝图 ID（路径式，如 "npc/yangzhou/dianxiaoer"） */
  id: string;
  /** 蓝图默认属性 */
  dbase: Record<string, any>;
  /** 获取蓝图属性值（支持路径访问） */
  getDbaseValue<T = any>(path: string): T | undefined;
}
