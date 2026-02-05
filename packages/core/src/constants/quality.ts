/**
 * 物品品质枚举与品质相关常量
 * 定义品质等级、品质乘数、品质中文标签
 */

/** 物品品质等级（0-4） */
export enum ItemQuality {
  COMMON = 0, // 凡品
  FINE = 1, // 精良
  RARE = 2, // 稀有
  EPIC = 3, // 史诗
  LEGENDARY = 4, // 传说
}

/** 品质属性乘数（品质越高加成越大） */
export const QUALITY_MULTIPLIER: Record<ItemQuality, number> = {
  [ItemQuality.COMMON]: 1.0,
  [ItemQuality.FINE]: 1.5,
  [ItemQuality.RARE]: 2.0,
  [ItemQuality.EPIC]: 2.5,
  [ItemQuality.LEGENDARY]: 3.0,
};

/** 品质中文标签 */
export const QUALITY_LABEL: Record<ItemQuality, string> = {
  [ItemQuality.COMMON]: '凡品',
  [ItemQuality.FINE]: '精良',
  [ItemQuality.RARE]: '稀有',
  [ItemQuality.EPIC]: '史诗',
  [ItemQuality.LEGENDARY]: '传说',
};
