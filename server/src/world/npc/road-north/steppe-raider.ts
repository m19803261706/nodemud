/**
 * 草原劫匪 — 官道北境段
 * 北漠狼庭麾下游骑，专在草原边缘劫掠过往商旅
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SteppeRaider extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '草原劫匪');
    this.set('short', '一名警惕四顾的草原劫匪');
    this.set(
      'long',
      '身穿北漠特有的羊皮袍子，腰间缠着宽皮带，上面挂着弯刀和皮囊。' +
        '脸上有深色的风沙纹路，颧骨高耸，眼神凌厉而多疑。' +
        '头发用皮绳束起，几缕散落在额前，随风飘动。' +
        '他的马术极好，即使现在徒步，走路的姿势也带着骑手的弧度，' +
        '随时能窜上马背消失在草原深处。' +
        '这类人本是北漠牧民，因饥荒或战败流散到边境，' +
        '以劫掠为生，凶悍且熟悉地形，官军多次清剿也难以根绝。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.LANG_TING);
    this.set('visible_faction', '北漠游骑');
    this.set('attitude', 'hostile');
    this.set('level', 8);
    this.set('max_hp', 280);
    this.set('hp', 280);
    this.set('combat_exp', 70);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '草原劫匪用北漠语低声咒骂了几句，含混不清，语气凶恶。',
      '草原劫匪将弯刀从刀鞘里拔出一截，拇指试了试刃口，又推回去。',
      '草原劫匪警惕地回头张望，确认身后无人后，目光重新落回你身上。',
    ]);
    this.set('inquiry', {
      default: '草原劫匪眯眼打量你：「中原人，值钱的东西留下，命给你带走。」',
    });
    this.set('equipment', []);
  }
}
