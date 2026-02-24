/**
 * 书院先生陆敬之 — 烟雨镇·青莲书院
 * 青莲书院的院长，学识渊博，为人方正
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class AcademyMaster extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陆敬之');
    this.set('short', '手持书卷的清瘦老者');
    this.set(
      'long',
      '陆敬之身着一袭洗得发白的蓝布长衫，头上束着方巾，' +
        '面容清癯，颧骨微高，一双眼睛虽已浑浊却仍透着读书人的精明。' +
        '他的手指修长而干枯，指尖常年沾着墨迹。' +
        '说话时习惯性地捋胡须，语速不快，每个字都像是经过斟酌。' +
        '在烟雨镇教了三十年书，桃李遍布江南，' +
        '只是这些年越发觉得能静下心读书的人少了。',
    );
    this.set('title', '青莲书院 院长');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '青莲书院');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('combat_exp', 0);
    this.set('personality', 'serious');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '陆敬之翻开一册古籍，低声诵读，偶尔摇头叹息。',
      '陆敬之用朱砂笔在学生的文章上圈圈画画，眉头紧锁。',
      '陆敬之放下书卷望向窗外，若有所思地叹了口气。',
      '陆敬之起身踱步到书架前，抽出一本书翻了翻又放回去。',
    ]);
    this.set('inquiry', {
      书院:
        '陆敬之抚须道：「青莲书院创立至今已逾百年，' +
        '虽比不得京城的太学，但在江南一带，也算是有些名望的。' +
        '可惜如今世道纷乱，愿意坐下来读书的少年是越来越少了。」',
      江湖:
        '陆敬之微微皱眉：「江湖之事，老朽本不该多言。' +
        '只是近来镇上多了许多陌生面孔，恐怕不是什么太平的征兆。' +
        '若你有心，不妨多留意南街那边的动静。」',
      default:
        '陆敬之放下手中书卷，微微颔首：「远来是客，书院虽小，' +
        '倒也有几本值得一读的古籍。你若有兴趣，尽可翻阅。」',
    });
  }
}
