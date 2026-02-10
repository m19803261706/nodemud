/**
 * QiInternalBase -- 中丹田·气系内功基类
 *
 * 气系内功主修 spirit（灵性）和 meridian（经脉）。
 * 提高内力上限和内力伤害，擅长气劲攻击。
 *
 * 丹田类型: QI（气）
 */
import { DantianType } from '@packages/core';
import { InternalSkillBase } from './internal-skill-base';

export abstract class QiInternalBase extends InternalSkillBase {
  /** 中丹田·气系 */
  get dantianType(): DantianType {
    return DantianType.QI;
  }
}
