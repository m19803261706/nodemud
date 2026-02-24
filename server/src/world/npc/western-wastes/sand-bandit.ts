/**
 * 沙匪 — 黄沙驿·废弃营地/沙窟
 * 盘踞沙漠边缘的匪徒，专门劫掠过路商队
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class SandBandit extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '沙匪');
    this.set('short', '一个蒙面持刀的沙匪');
    this.set(
      'long',
      '此人用一块脏布蒙住口鼻，只露出一双充满戾气的眼睛。' +
        '穿着破旧的皮甲，上面打满了补丁，有几处还能看到干涸的血迹。' +
        '手里握着一把豁了口的弯刀，刀面上锈迹斑斑，但刀刃仍然锋利。' +
        '脚上穿着一双厚底的皮靴，靴筒里塞着一把匕首。' +
        '他是沙漠里的亡命之徒，原本可能是逃兵、逃犯或破产的商人，' +
        '走投无路之后落了草，靠劫掠过路的驼队和商旅为生。' +
        '在沙漠里活久了的人，眼睛里都有一种冷酷而麻木的光。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 12);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('combat_exp', 90);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '沙匪警惕地四处张望，手里的弯刀从不离手。',
      '沙匪蹲在角落里啃着干肉，吃相粗野，吃完用袖子擦嘴。',
      '沙匪和同伴低声密谋，偶尔指向驿站的方向，眼中闪着贪婪的光。',
    ]);
    this.set('inquiry', {
      default: '沙匪狞笑着举起弯刀：「把值钱的东西都留下，然后滚！不然老子送你去见阎王！」',
    });
  }
}
