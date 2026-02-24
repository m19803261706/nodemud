/**
 * 驿站守卫 — 黄沙驿·哨卡
 * 驿长雇佣的本地守卫，负责巡逻和防匪
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class DesertGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '驿站守卫');
    this.set('short', '一个腰别弯刀的守卫');
    this.set(
      'long',
      '他穿着土黄色的粗布袍子，腰间别着一把西域弯刀和一只水囊。' +
        '头上缠着头巾，遮住了大半张脸，只露出一双被日晒得发红的眼睛。' +
        '身材壮实，站在那里像一堵移动的土墙。' +
        '他是驿长萨木哈雇来的本地人，负责巡逻哨卡、驱赶可疑人物。' +
        '不怎么说话，但眼神锐利，始终在扫视周围的动静。' +
        '据说驿站的守卫大多是退下来的沙漠猎人或前沙匪洗白的人——' +
        '谁比他们更了解沙漠里的危险呢？',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '黄沙驿');
    this.set('attitude', 'neutral');
    this.set('level', 14);
    this.set('max_hp', 500);
    this.set('hp', 500);
    this.set('personality', 'stern');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 10);
    this.set('chat_msg', [
      '驿站守卫目光警惕地扫视着四周，手一直搭在弯刀柄上。',
      '驿站守卫交换了一下站姿，沙地上留下深深的脚印。',
      '驿站守卫往远处看了一眼，像是发现了什么，但片刻后又放松了。',
    ]);
    this.set('inquiry', {
      沙匪: '驿站守卫沉声道：「最近沙匪活动频繁，北边的沙丘后面常有人影。天黑了别出驿站。」',
      驿长: '驿站守卫点了点头：「萨木哈是好老板，按时发饷，不乱来。在这地方，能按时发饷的老板不多。」',
      default: '驿站守卫用下巴示意了一下方向：「有事去找驿长。我只管看门。」',
    });
  }
}
