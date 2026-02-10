/**
 * ShenInternalBase -- 上丹田·神系内功基类
 *
 * 神系内功主修 wisdom（根骨）和 perception（敏捷）。
 * 提高精神属性和内力恢复速度，擅长精神攻击。
 *
 * 丹田类型: SHEN（神）
 */
import { DantianType } from '@packages/core';
import { InternalSkillBase } from './internal-skill-base';

export abstract class ShenInternalBase extends InternalSkillBase {
  /** 上丹田·神系 */
  get dantianType(): DantianType {
    return DantianType.SHEN;
  }
}
