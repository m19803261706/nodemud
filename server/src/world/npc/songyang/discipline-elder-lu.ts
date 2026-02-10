/**
 * 陆长老 — 嵩阳宗执法长老
 * 门派职责：纪律与戒律巡查（本期无交互动作）
 */
import { Factions } from '@packages/core';
import { NpcBase } from '../../../engine/game-objects/npc-base';

export default class SongyangDisciplineElderLu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陆长老');
    this.set('short', '一位眼神凌厉的黑袍长老');
    this.set(
      'long',
      '陆长老衣袍无纹，腰悬木尺。传闻他年轻时执剑行狱，入宗后改以门规立威，弟子们见他都要下意识站直。',
    );
    this.set('title', '嵩阳宗 执法长老');
    this.set('gender', 'male');
    this.set('faction', Factions.SONG_YANG);
    this.set('visible_faction', '嵩阳宗');
    this.set('attitude', 'neutral');
    this.set('level', 43);
    this.set('max_hp', 3100);
    this.set('hp', 3100);
    this.set('combat_exp', 5600);

    this.set('sect_id', 'songyang');

    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '陆长老冷声道：「人可有错，门规不可乱。」',
      '陆长老用木尺轻点石阶，示意旁人站位端正。',
      '陆长老看了你一眼，又把视线移回戒律碑。',
    ]);

    this.set('inquiry', {
      门规: '陆长老道：「守规矩是护你，不是困你。」',
      纪律: '陆长老道：「江湖乱，门里不能乱。」',
      default: '陆长老道：「有话就说，莫要绕弯。」',
    });
  }
}
