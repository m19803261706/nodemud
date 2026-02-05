/**
 * 物品系统常量定义
 * 物品类型、武器类型、装备位置等前后端共享常量
 */

/** 物品大类 */
export const ItemTypes = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  MEDICINE: 'medicine',
  BOOK: 'book',
  CONTAINER: 'container',
  FOOD: 'food',
  KEY: 'key',
  MISC: 'misc',
} as const;

export type ItemType = (typeof ItemTypes)[keyof typeof ItemTypes];

/** 武器类型 */
export const WeaponTypes = {
  SWORD: 'sword',
  BLADE: 'blade',
  SPEAR: 'spear',
  STAFF: 'staff',
  FIST: 'fist',
  DAGGER: 'dagger',
  WHIP: 'whip',
  HAMMER: 'hammer',
  AXE: 'axe',
} as const;

export type WeaponType = (typeof WeaponTypes)[keyof typeof WeaponTypes];

/** 装备位置 */
export const WearPositions = {
  HEAD: 'head',
  BODY: 'body',
  HANDS: 'hands',
  FEET: 'feet',
  WAIST: 'waist',
  WEAPON: 'weapon',
  OFFHAND: 'offhand',
  NECK: 'neck',
  FINGER: 'finger',
  WRIST: 'wrist',
} as const;

export type WearPosition = (typeof WearPositions)[keyof typeof WearPositions];
