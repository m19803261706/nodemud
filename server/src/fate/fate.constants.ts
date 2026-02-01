/**
 * 命格常量配置
 * 紫微主星映射表、出身配置、亮度评分
 */

import type { CharacterAttributes } from '@packages/core';

/** 主星亮度评分 */
export const BRIGHTNESS_SCORE: Record<string, number> = {
  庙: 5,
  旺: 4,
  得: 3,
  利: 2,
  平: 1,
  不: 0,
  陷: -1,
  '': 1, // 无亮度标注默认1
};

/** 命宫主星 → 命格映射 */
export const FATE_STAR_MAP: Record<
  string,
  {
    fateName: string;
    fateType: string;
    fatePoem: string;
    attrBias: Record<keyof CharacterAttributes, number>;
  }
> = {
  紫微: {
    fateName: '紫微在命',
    fateType: 'ziwei',
    fatePoem: '紫微高照居中天，帝星临世主威权',
    attrBias: { wisdom: 1, perception: 1, spirit: 1, meridian: 1, strength: 1, vitality: 1 },
  },
  天机: {
    fateName: '天机化变',
    fateType: 'tianji',
    fatePoem: '机关算尽天下事，一朝悟道入青云',
    attrBias: { wisdom: 3, perception: 2, spirit: 0, meridian: 0, strength: -2, vitality: -1 },
  },
  太阳: {
    fateName: '日照中天',
    fateType: 'taiyang',
    fatePoem: '赤日当空照四方，光明磊落走八荒',
    attrBias: { wisdom: 0, perception: 0, spirit: -1, meridian: -1, strength: 3, vitality: 2 },
  },
  武曲: {
    fateName: '武曲临门',
    fateType: 'wuqu',
    fatePoem: '武曲刚金主杀伐，铁骨铮铮震四方',
    attrBias: { wisdom: -1, perception: 0, spirit: 2, meridian: -1, strength: 3, vitality: 0 },
  },
  天同: {
    fateName: '天同福泽',
    fateType: 'tiantong',
    fatePoem: '天同化福享安宁，闲云野鹤伴平生',
    attrBias: { wisdom: 0, perception: -1, spirit: 0, meridian: 2, strength: -1, vitality: 3 },
  },
  廉贞: {
    fateName: '廉贞入命',
    fateType: 'lianzhen',
    fatePoem: '廉贞化气性多端，亦正亦邪两极间',
    attrBias: { wisdom: 2, perception: -2, spirit: 3, meridian: -2, strength: 2, vitality: -1 },
  },
  天府: {
    fateName: '天府坐镇',
    fateType: 'tianfu',
    fatePoem: '天府厚德载万物，稳如磐石立乾坤',
    attrBias: { wisdom: 1, perception: 1, spirit: 1, meridian: 1, strength: 1, vitality: 1 },
  },
  太阴: {
    fateName: '太阴化清',
    fateType: 'taiyin',
    fatePoem: '太阴如水照冰心，静水深流蕴万金',
    attrBias: { wisdom: 0, perception: -1, spirit: 3, meridian: 2, strength: -2, vitality: 0 },
  },
  贪狼: {
    fateName: '贪狼桃花',
    fateType: 'tanlang',
    fatePoem: '贪狼化气主风流，桃花朵朵满枝头',
    attrBias: { wisdom: 0, perception: 3, spirit: 0, meridian: -1, strength: 0, vitality: 2 },
  },
  巨门: {
    fateName: '巨门暗曜',
    fateType: 'jumen',
    fatePoem: '巨门暗曜多是非，口舌生风辨真伪',
    attrBias: { wisdom: 3, perception: 1, spirit: 0, meridian: 0, strength: -1, vitality: -1 },
  },
  天相: {
    fateName: '天相辅弼',
    fateType: 'tianxiang',
    fatePoem: '天相端庄辅帝星，左右逢源济苍生',
    attrBias: { wisdom: 2, perception: 0, spirit: 0, meridian: 2, strength: -1, vitality: 0 },
  },
  天梁: {
    fateName: '天梁化禄',
    fateType: 'tianliang',
    fatePoem: '天梁化荫寿星高，逢凶化吉福自来',
    attrBias: { wisdom: 0, perception: 0, spirit: -1, meridian: 2, strength: 0, vitality: 3 },
  },
  七杀: {
    fateName: '七杀破军',
    fateType: 'qisha',
    fatePoem: '七杀临身胆气豪，将星入命镇边陲',
    attrBias: { wisdom: -1, perception: 2, spirit: 0, meridian: -2, strength: 3, vitality: 1 },
  },
  破军: {
    fateName: '破军先锋',
    fateType: 'pojun',
    fatePoem: '破军横行不畏难，先锋开路斩万关',
    attrBias: { wisdom: -2, perception: 1, spirit: 2, meridian: -1, strength: 2, vitality: 1 },
  },
};

/** 出身配置 */
export const ORIGIN_CONFIG: Record<
  string,
  {
    nameZh: string;
    story: string;
    bonus: Partial<Record<keyof CharacterAttributes, number>>;
    perk: string;
  }
> = {
  noble: {
    nameZh: '世家子弟',
    story: '武林世家的后人，家道中落，身怀残缺秘籍踏入江湖',
    bonus: { wisdom: 1, spirit: 1 },
    perk: '起步带一本残缺家传秘籍',
  },
  wanderer: {
    nameZh: '江湖浪子',
    story: '从小在市井中摸爬滚打，见惯了三教九流',
    bonus: { perception: 1, vitality: 1 },
    perk: '起步有额外银两和江湖关系',
  },
  scholar: {
    nameZh: '书院学子',
    story: '读圣贤书的文人，偶入江湖，以智谋立足',
    bonus: { wisdom: 2, strength: -1 },
    perk: '识字能力强，能读更多秘籍',
  },
  soldier: {
    nameZh: '边塞军卒',
    story: '从军归来的退役兵士，一身杀伐之气',
    bonus: { strength: 1, vitality: 1 },
    perk: '起步带一把制式兵器',
  },
  herbalist: {
    nameZh: '山野药童',
    story: '深山采药人的徒弟，通晓草木之性',
    bonus: { meridian: 1, perception: 1 },
    perk: '懂基础药理，能辨认草药',
  },
  beggar: {
    nameZh: '乞丐流民',
    story: '一无所有的底层人，却有着非凡的际遇',
    bonus: {},
    perk: '机缘维度+2，奇遇概率大增',
  },
};
