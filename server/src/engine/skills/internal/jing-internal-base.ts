/**
 * JingInternalBase -- 下丹田·精系内功基类
 *
 * 精系内功主修 strength（力量）和 vitality（体质）。
 * 提高生命上限和物理伤害，擅长刚猛路线。
 *
 * 丹田类型: JING（精）
 */
import { DantianType } from '@packages/core';
import { InternalSkillBase } from './internal-skill-base';

export abstract class JingInternalBase extends InternalSkillBase {
  /** 下丹田·精系 */
  get dantianType(): DantianType {
    return DantianType.JING;
  }
}
