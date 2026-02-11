/**
 * 技能学艺失败原因可读化
 * 将后端 reason 映射为面向玩家的提示文案。
 */
import type { SkillLearnFailureReason } from '@packages/core';

const REASON_HINT_MAP: Record<SkillLearnFailureReason, string> = {
  unlock_rank_required: '职位或门派贡献不足，请先完成门派事务提升身份。',
  unlock_attr_required: '基础属性未达要求，先提升对应属性后再来学艺。',
  unlock_preq_skill_required: '前置技能等级不足，请先把前置武学练上去。',
  unlock_puzzle_canju_required: '尚未完成残卷拼合，请先收集并补齐残卷线索。',
  unlock_puzzle_duanju_required: '尚未通过碑文断句，请先前往对应门派考核。',
  unlock_puzzle_shiyan_required: '尚未通过试演答卷，请先完成试演挑战。',
  unlock_challenge_required: '门派挑战尚未达成，请先完成指定挑战目标。',
  canon_crippled: '此传承已断裂，仅余二成心得，不可再运使或精进。',
  insufficient_silver: '银两不足，补足学费后可继续学习。',
  insufficient_energy: '精力不足，请先休整再学艺。',
  insufficient_potential: '潜能已尽，先去历练江湖、再来请教师门。',
  teacher_cap_reached: '此门所授已尽，需另寻机缘再求精进。',
  cannot_improve: '当前境界受限，暂时无法继续精进此技能。',
};

export function getSkillLearnFailureHint(reason?: string): string | null {
  if (!reason) return null;
  if (!(reason in REASON_HINT_MAP)) return null;
  return REASON_HINT_MAP[reason as SkillLearnFailureReason];
}
