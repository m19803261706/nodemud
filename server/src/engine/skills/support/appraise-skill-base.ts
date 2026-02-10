/**
 * AppraiseSkillBase -- 辨识基类
 *
 * 所有辨识技能的抽象基类。
 * 固定 skillType = APPRAISE。
 *
 * 辨识特点：鉴定物品属性和品质，发现隐藏信息
 */
import { SkillSlotType } from '@packages/core';
import { SupportSkillBase } from './support-skill-base';

export abstract class AppraiseSkillBase extends SupportSkillBase {
  /** 辨识固定对应 APPRAISE 槽位 */
  get skillType(): SkillSlotType {
    return SkillSlotType.APPRAISE;
  }
}
