/**
 * 黑市打手 — 潮汐港·黑市
 * 负责维持黑市秩序的凶悍打手
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class BlackMarketGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '黑市打手');
    this.set('short', '抱臂站在摊位前的凶悍打手');
    this.set(
      'long',
      '一个面容冷峻的壮汉抱着胳膊站在黑市入口，' +
        '目光像两把刀子一样扫视每一个进来的人。' +
        '他的左耳缺了一小块，据说是以前跟人斗殴时被咬掉的，' +
        '伤口早就愈合了，留下一圈不规则的疤痕。' +
        '他穿着一件无袖的皮甲，露出满是伤痕的胳膊，' +
        '右手握着一根裹了铁皮的木棒——' +
        '这东西打人不见血，但骨头会碎。' +
        '在黑市，他就是规矩。' +
        '任何试图闹事、偷窃或赖账的人，' +
        '都会成为这根铁棒下一个招呼的对象。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.SAN_MENG);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 18);
    this.set('max_hp', 700);
    this.set('hp', 700);
    this.set('combat_exp', 35);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '黑市打手用铁棒敲了敲地面，沉闷的声响让周围的人不自觉地缩了缩脖子。',
      '黑市打手冷冷地瞪着一个鬼鬼祟祟的家伙，对方连忙加快脚步走了。',
      '黑市打手打了个哈欠，但那双眼睛一刻也没放松过警惕。',
    ]);
    this.set('inquiry', {
      default: '黑市打手冷冷地说：「买东西找摊主。找事？找我。」',
    });
  }
}
