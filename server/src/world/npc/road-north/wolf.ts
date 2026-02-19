/**
 * 草原狼 — 官道北境段
 * 冻原小径的野生狼群，嗅觉灵敏，行动迅猛
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class Wolf extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '草原狼');
    this.set('short', '一匹在路边游荡的草原狼');
    this.set(
      'long',
      '体型比寻常家犬大出一圈，皮毛灰白夹杂着枯草色，' +
        '与冻原的背景融为一体，极难被及时发现。' +
        '四肢粗壮有力，脚爪踩在冻土上无声无息，' +
        '眼睛是淡黄色的，像两颗嵌在皮毛里的磷火，' +
        '盯着猎物时带着一种冷静而专注的饥饿感。' +
        '颈背处的毛竖立着，那是随时准备发动攻击的信号。',
    );
    this.set('title', '');
    this.set('gender', 'neutral');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 6);
    this.set('max_hp', 180);
    this.set('hp', 180);
    this.set('combat_exp', 45);
    this.set('personality', 'aggressive');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '草原狼低沉地嗥叫一声，喉咙里发出威胁性的轰鸣。',
      '草原狼将鼻尖贴近地面，急促地嗅闻着什么气味。',
      '草原狼在附近游荡踱步，黄色的眼睛扫视四周。',
    ]);
    this.set('inquiry', {
      default: '草原狼对你的靠近没有任何语言上的回应，只是龇牙，露出尖利的獠牙。',
    });
  }
}
