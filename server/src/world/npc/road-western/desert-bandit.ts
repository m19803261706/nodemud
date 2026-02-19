/**
 * 沙漠强盗 — 丝路·西域段
 * 盘踞西域丝路的劫匪，粗犷凶悍，用弯刀和沙尘为武器
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DesertBandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沙漠强盗');
    this.set('short', '一个用头巾遮面的沙漠劫匪');
    this.set(
      'long',
      '他从头到脚裹在粗布里，只露出一双警惕的眼睛，' +
        '厚实的头巾遮住口鼻，不知是为了防沙还是为了不被认出。' +
        '腰间别着一把弯刀，刀身弯度极大，是西域特有的刀型，' +
        '在沙地里打滚、贴身格斗时最为好用。' +
        '他们在这条丝路上活了多少代，谁也说不清，' +
        '对于商队来说，沙漠强盗是比风沙更难对付的天灾。' +
        '他时不时用某种外人听不懂的西域方言低声说话，也许是在和同伴通气。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 12);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('combat_exp', 95);
    this.set('personality', 'grumpy');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 6);
    this.set('chat_msg', [
      '沙漠强盗用头巾遮住口鼻，只露出两只眼睛，警惕地四下张望。',
      '沙漠强盗低声说了几句西域方言，含混不清，像是在和某人交谈。',
      '沙漠强盗慢慢磨着手里的弯刀，刀刃在阳光下反出一道冷光。',
      '沙漠强盗蹲在黄沙里，像是融入了背景，静静等候着什么。',
    ]);
    this.set('inquiry', {
      default: '沙漠强盗握紧弯刀，声音低哑：「留下买路钱，不然——」他没说完，意思已经很清楚了。',
    });
  }
}
