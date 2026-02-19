/**
 * 废都守卫 — 洛阳废都·北城门
 * 承天朝派驻的守卫，人手不足，士气低落，例行盘查进城者
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class CityGuard extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '废都守卫');
    this.set('short', '一名精神不振的守卫');
    this.set(
      'long',
      '一名穿着承天朝制式甲胄的守卫，甲胄上有几处修补的痕迹，兵器也不算锋利。' +
        '他靠在城门洞旁，神情懒散，不时打量着来往的行人。' +
        '据说这里的守卫编制已经缩减了大半，留下的人大多是故土难离或无处可去的。' +
        '上官倒是每月按时发饷，但这座废都能维持多久，谁也说不准。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'neutral');
    this.set('level', 8);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('personality', 'pragmatic');
    this.set('speech_style', 'terse');
    this.set('chat_chance', 15);
    this.set('chat_msg', [
      '废都守卫抬眼打量了一下经过的路人，又低下了头。',
      '废都守卫无精打采地靠着城门，抹了把脸，像是在驱赶困意。',
    ]);
    this.set('inquiry', {
      default: '废都守卫翻了你一眼：「进城可以，别惹事。这里是承天朝的地界，闹事了可别怪我们。」他摆了摆手，示意你过去。',
    });
  }
}
