/**
 * FateService — 命格生成核心
 * 基于 iztro 紫微斗数排盘生成角色命格
 */

import { Injectable } from '@nestjs/common';
import { astro } from 'iztro';
import type { CharacterAttributes } from '@packages/core';
import { BRIGHTNESS_SCORE, FATE_STAR_MAP } from './fate.constants';

/** 命格生成结果 */
export interface FateResult {
  fateName: string;
  fateType: string;
  fatePoem: string;
  destiny: number;
  benefactor: number;
  calamity: number;
  fortune: number;
  attributeCaps: CharacterAttributes;
  wuxingju: string;
  mingzhuStar: string;
  shenzhuStar: string;
  astrolabeJson: object;
}

@Injectable()
export class FateService {
  /**
   * 生成命格
   * @param gender 性别
   * @returns 完整命格数据
   */
  generateFate(gender: 'male' | 'female'): FateResult {
    // 1. 获取服务器当前时间
    const now = new Date();
    const solarDate = this.formatDate(now);
    const timeIndex = this.getTimeIndex(now);

    // 2. 调用 iztro 排盘
    const astrolabe = astro.bySolar(solarDate, timeIndex, gender === 'male' ? '男' : '女');

    // 3. 提取命宫主星
    const soulPalace = this.findPalace(astrolabe.palaces, '命宫');
    const mainStarName = this.getMainStar(soulPalace);

    // 4. 查表映射命格名称和诗句
    const fateConfig = FATE_STAR_MAP[mainStarName] || FATE_STAR_MAP['天府']; // 查不到默认天府

    // 5. 计算命运四维度（基于四化）
    const dimensions = this.calcDestinyDimensions(astrolabe.palaces);

    // 6. 计算六属性上限分布（归一化到总和=42）
    const attributeCaps = this.calcAttributeCaps(astrolabe.palaces);

    // 7. 提取五行局、命主星、身主星
    const wuxingju = astrolabe.fiveElementsClass || '土五局';
    const mingzhuStar = this.getMingzhuStar(astrolabe.palaces);
    const shenzhuStar = this.getShenzhuStar(astrolabe.palaces);

    // 8. 序列化排盘数据（仅保留核心字段，去掉方法）
    const astrolabeJson = this.serializeAstrolabe(astrolabe);

    return {
      fateName: fateConfig.fateName,
      fateType: fateConfig.fateType,
      fatePoem: fateConfig.fatePoem,
      ...dimensions,
      attributeCaps,
      wuxingju,
      mingzhuStar,
      shenzhuStar,
      astrolabeJson,
    };
  }

  /**
   * 属性上限归一化算法
   * 保证总和=42，每项在[4,10]范围内
   */
  private calcAttributeCaps(palaces: any[]): CharacterAttributes {
    // 各宫位星耀强度评分
    const rawScores: CharacterAttributes = {
      wisdom: this.scorePalaces(palaces, ['命宫'], true), // +身宫
      perception: this.scorePalaces(palaces, ['迁移', '福德']),
      spirit: this.scorePalaces(palaces, ['财帛', '官禄']),
      meridian: this.scorePalaces(palaces, ['疾厄']),
      strength: this.scorePalaces(palaces, ['兄弟', '父母']),
      vitality: this.scorePalaces(palaces, ['子女', '夫妻']),
    };

    // 归一化到总和=42，范围[4,10]
    return this.normalizeCaps(rawScores, 42, 4, 10);
  }

  /**
   * 宫位星耀强度评分
   * 主星亮度权重 + 辅星加减分 + 身宫加分
   */
  private scorePalaces(palaces: any[], names: string[], includeBody = false): number {
    let score = 0;
    for (const palace of palaces) {
      const isTarget = names.some((n) => palace.name.includes(n));
      const isBody = includeBody && palace.isBodyPalace;
      if (!isTarget && !isBody) continue;

      // 主星亮度评分
      for (const star of palace.majorStars) {
        score += BRIGHTNESS_SCORE[star.brightness] ?? 1;
      }
      // 辅星加减分：吉星+1，煞星-1
      for (const star of palace.minorStars) {
        score += star.type === 'soft' ? 1 : star.type === 'tough' ? -1 : 0;
      }
      // 身宫加分
      if (palace.isBodyPalace) score += 1;
      // 空宫保底
      if (palace.majorStars.length === 0) score += 1;
    }
    return Math.max(score, 1); // 最低1分
  }

  /**
   * 归一化算法
   * 将原始分数映射到 [min, max] 范围，保证总和 = targetSum
   */
  private normalizeCaps(
    raw: CharacterAttributes,
    targetSum: number,
    min: number,
    max: number,
  ): CharacterAttributes {
    const keys = Object.keys(raw) as (keyof CharacterAttributes)[];
    const totalRaw = keys.reduce((sum, k) => sum + raw[k], 0);

    // 第一轮：按比例缩放
    const scaled: CharacterAttributes = {} as any;
    for (const k of keys) {
      scaled[k] = Math.round((raw[k] / totalRaw) * targetSum);
      scaled[k] = Math.max(min, Math.min(max, scaled[k]));
    }

    // 第二轮：贪心修正误差，调整距离边界最远的属性
    let currentSum = keys.reduce((sum, k) => sum + scaled[k], 0);
    while (currentSum !== targetSum) {
      const diff = targetSum - currentSum;
      const direction = diff > 0 ? 1 : -1;

      // 找最适合调整的属性（距离边界最远的）
      let bestKey: keyof CharacterAttributes = keys[0];
      let bestMargin = 0;
      for (const k of keys) {
        const margin = direction > 0 ? max - scaled[k] : scaled[k] - min;
        if (margin > bestMargin) {
          bestMargin = margin;
          bestKey = k;
        }
      }
      scaled[bestKey] += direction;
      currentSum += direction;
    }

    return scaled;
  }

  /**
   * 命运四维度计算
   * 基于四化在十二宫的分布
   */
  private calcDestinyDimensions(palaces: any[]): {
    destiny: number;
    benefactor: number;
    calamity: number;
    fortune: number;
  } {
    let luCount = 0;
    let quanCount = 0;
    let keCount = 0;
    let jiCount = 0;

    for (const palace of palaces) {
      for (const star of [...palace.majorStars, ...palace.minorStars]) {
        const mutagen = star.mutagen || '';
        if (mutagen === '禄') luCount++;
        if (mutagen === '权') quanCount++;
        if (mutagen === '科') keCount++;
        if (mutagen === '忌') jiCount++;
      }
    }

    // 映射到 1-5 星（基础3星，有四化+1~2）
    return {
      fortune: Math.min(5, Math.max(1, 3 + luCount)), // 化禄 → 机缘
      destiny: Math.min(5, Math.max(1, 3 + quanCount)), // 化权 → 命数
      benefactor: Math.min(5, Math.max(1, 3 + keCount)), // 化科 → 贵人
      calamity: Math.min(5, Math.max(1, 3 + jiCount)), // 化忌 → 劫数
    };
  }

  /** 日期格式化 YYYY-M-D */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  /** 当前时间 → 时辰序号 (0=早子,1=丑,...,12=晚子) */
  private getTimeIndex(date: Date): number {
    const hour = date.getHours();
    if (hour >= 23 || hour < 1) return 0; // 子时
    return Math.floor((hour + 1) / 2);
  }

  /** 从宫位数组中找指定宫位 */
  private findPalace(palaces: any[], name: string): any {
    return palaces.find((p: any) => p.name === name) || palaces[0];
  }

  /** 获取宫位主星名称（取第一颗，iztro 按重要性排序） */
  private getMainStar(palace: any): string {
    if (!palace.majorStars || palace.majorStars.length === 0) return '天府'; // 空宫默认天府
    return palace.majorStars[0].name;
  }

  /** 获取命主星 */
  private getMingzhuStar(palaces: any[]): string {
    const soul = this.findPalace(palaces, '命宫');
    if (soul.majorStars && soul.majorStars.length > 0) {
      return soul.majorStars[0].name;
    }
    return '天府';
  }

  /** 获取身主星 */
  private getShenzhuStar(palaces: any[]): string {
    const body = palaces.find((p: any) => p.isBodyPalace);
    if (body && body.majorStars && body.majorStars.length > 0) {
      return body.majorStars[0].name;
    }
    return '天府';
  }

  /** 序列化排盘数据（仅保留核心字段） */
  private serializeAstrolabe(astrolabe: any): object {
    return {
      solarDate: astrolabe.solarDate,
      lunarDate: astrolabe.lunarDate,
      time: astrolabe.time,
      sign: astrolabe.sign,
      zodiac: astrolabe.zodiac,
      fiveElementsClass: astrolabe.fiveElementsClass,
      palaces: astrolabe.palaces.map((p: any) => ({
        name: p.name,
        isBodyPalace: p.isBodyPalace,
        heavenlyStem: p.heavenlyStem,
        earthlyBranch: p.earthlyBranch,
        majorStars: p.majorStars.map((s: any) => ({
          name: s.name,
          brightness: s.brightness,
          mutagen: s.mutagen,
        })),
        minorStars: p.minorStars.map((s: any) => ({
          name: s.name,
          type: s.type,
          brightness: s.brightness,
          mutagen: s.mutagen,
        })),
      })),
    };
  }
}
