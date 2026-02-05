/**
 * eq 指令 -- 查看装备栏
 *
 * 列出玩家当前所有装备槽位及已装备的物品。
 *
 * 对标: LPC equipment / 炎黄 eq_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import type { LivingBase } from '../../game-objects/living-base';
import { PlayerBase } from '../../game-objects/player-base';
import { rt } from '@packages/core';

/** 槽位中文名 */
const POSITION_LABEL: Record<string, string> = {
  head: '头部',
  body: '身体',
  hands: '手部',
  feet: '脚部',
  waist: '腰部',
  weapon: '主手',
  offhand: '副手',
  neck: '颈部',
  finger: '手指',
  wrist: '腕部',
};

@Command({ name: 'eq', aliases: ['装备栏'], description: '查看装备列表' })
export class EqCommand implements ICommand {
  name = 'eq';
  aliases = ['装备栏'];
  description = '查看装备列表';
  directory = 'std';

  execute(executor: LivingBase, _args: string[]): CommandResult {
    if (!(executor instanceof PlayerBase)) {
      return { success: false, message: '只有玩家才能查看装备栏。' };
    }

    const lines: string[] = ['你的装备：'];
    for (const [pos, item] of executor.getEquipment()) {
      const label = POSITION_LABEL[pos] || pos;
      if (item) {
        lines.push(`  ${label}: ${rt('item', item.getName())}`);
      } else {
        lines.push(`  ${label}: 空`);
      }
    }

    return {
      success: true,
      message: lines.join('\n'),
      data: { action: 'eq' },
    };
  }
}
