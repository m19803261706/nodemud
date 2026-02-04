/**
 * ask 指令 -- 向 NPC 提问
 *
 * 支持格式:
 *   ask <npc名> about <关键词>
 *   ask <npc名> <关键词>
 *
 * 匹配 NPC 的 inquiry 映射返回回答，未匹配则走 default。
 *
 * 对标: LPC ask / 炎黄 ask_cmd
 */
import { Command, type ICommand, type CommandResult } from '../../types/command';
import { LivingBase } from '../../game-objects/living-base';
import { NpcBase } from '../../game-objects/npc-base';
import { RoomBase } from '../../game-objects/room-base';
import { rt } from '@packages/core';

@Command({ name: 'ask', aliases: ['问', '打听'], description: '向 NPC 提问' })
export class AskCommand implements ICommand {
  name = 'ask';
  aliases = ['问', '打听'];
  description = '向 NPC 提问';
  directory = 'std';

  execute(executor: LivingBase, args: string[]): CommandResult {
    if (args.length < 2) {
      return { success: false, message: '格式: ask <npc名> about <关键词>' };
    }

    const env = executor.getEnvironment();
    if (!env || !(env instanceof RoomBase)) {
      return { success: false, message: '你不在任何房间中。' };
    }

    // 解析参数：优先按 " about " 分割
    const raw = args.join(' ');
    let npcName: string;
    let keyword: string;

    const aboutIdx = raw.indexOf(' about ');
    if (aboutIdx !== -1) {
      npcName = raw.substring(0, aboutIdx).trim();
      keyword = raw.substring(aboutIdx + 7).trim();
    } else {
      // 简写格式：第一个词为 npc 名，其余为关键词
      npcName = args[0];
      keyword = args.slice(1).join(' ');
    }

    if (!npcName || !keyword) {
      return { success: false, message: '格式: ask <npc名> about <关键词>' };
    }

    // 在房间中查找 NPC（模糊匹配）
    const inventory = env.getInventory();
    const npc = inventory.find(
      (e) => e instanceof NpcBase && (e as NpcBase).getName().includes(npcName),
    ) as NpcBase | undefined;

    if (!npc) {
      return { success: false, message: '这里没有这个人。' };
    }

    // 触发 onChat 钩子
    npc.onChat(executor, keyword);

    // 查找 inquiry 映射
    const inquiry = npc.get<Record<string, string>>('inquiry');
    const name = npc.getName();

    const prefix = `你向${rt('npc', name)}打听${rt('sys', keyword)}。\n`;

    if (!inquiry) {
      return {
        success: true,
        message: prefix + `${rt('npc', name)}没有回应你。`,
        data: { action: 'ask', npcId: npc.id, keyword, matched: false },
      };
    }

    // 匹配关键词 → default → 无回应
    const answer = inquiry[keyword] ?? inquiry['default'];
    if (answer) {
      return {
        success: true,
        message: prefix + answer,
        data: { action: 'ask', npcId: npc.id, keyword, matched: keyword in inquiry },
      };
    }

    return {
      success: true,
      message: prefix + `${rt('npc', name)}没有回应你。`,
      data: { action: 'ask', npcId: npc.id, keyword, matched: false },
    };
  }
}
