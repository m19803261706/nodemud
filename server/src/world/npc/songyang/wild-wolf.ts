/**
 * 野狼 — 山间溪涧
 * 低级野兽，在溪涧附近觅食
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WildWolf extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '野狼');
    this.set('short', '一头灰毛野狼');
    this.set(
      'long',
      '一头灰色皮毛的野狼，身形精瘦，肋骨若隐若现。它弓着脊背，尾巴低垂，黄绿色的眼睛紧紧盯着四周动静。嘴边还沾着暗红的血迹，大约是刚捕食过什么小兽。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 4);
    this.set('max_hp', 160);
    this.set('hp', 160);
    this.set('combat_exp', 35);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'none');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '野狼低伏着身子，发出呜咽般的低吼。',
      '野狼竖起耳朵，警觉地嗅了嗅空气。',
      '野狼围着溪畔绕了一圈，似乎在寻找猎物。',
    ]);
    this.set('inquiry', {
      default: '野狼龇牙发出威胁的低吼。',
    });
  }
}
