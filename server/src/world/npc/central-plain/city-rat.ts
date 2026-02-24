/**
 * 废都硕鼠 — 洛阳废都·古井底 / 殿下暗室
 * 废都地下常见野怪，体型如猫，眼红凶猛，可战斗
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class CityRat extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '废都硕鼠');
    this.set('short', '一只猫那么大的巨鼠');
    this.set(
      'long',
      '一只体型堪比成年猫的巨鼠，灰褐色的皮毛油腻蓬乱，' +
        '尾巴又粗又长，在地面无声地扫动。' +
        '两只红色的眼睛在黑暗中发着幽光，盯人的眼神带着野兽的直接。' +
        '嘴里不时露出一对黄色的长牙——' +
        '这是在废都地下混了多年的老鼠，咬过铜管，啃过石箱，' +
        '什么都不怕。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'hostile');
    this.set('level', 6);
    this.set('max_hp', 180);
    this.set('hp', 180);
    this.set('combat_exp', 40);
    this.set('chat_chance', 5);
    this.set('chat_msg', [
      '废都硕鼠蹲在暗处，红色的眼睛盯着你。',
      '废都硕鼠「吱吱」叫着，尖利的牙齿在暗光中一闪。',
    ]);
  }
}
