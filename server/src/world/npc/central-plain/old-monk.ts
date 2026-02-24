/**
 * 枯禅法师 — 洛阳废都·破败寺院
 * 枯瘦老僧，佛道并修，平静达观，视废墟为道场
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class OldMonk extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '枯禅');
    this.set('short', '一个枯瘦如柴的老僧');
    this.set(
      'long',
      '一位形销骨立的老僧，僧袍破旧而干净，' +
        '如同他本人——贫乏而自持。' +
        '他盘膝坐于残殿一角，脊背挺直，合十的手掌上青筋毕露。' +
        '面前一盏油灯，灯火微弱，却在他脸上映出一种平静的光。' +
        '身后那半截残佛面目模糊，枯禅反而比它更像一尊雕像。' +
        '有人说他在这里坐了二十年，也有人说是三十年——他自己从不解释。',
    );
    this.set('title', '法师');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 20);
    this.set('max_hp', 700);
    this.set('hp', 700);
    this.set('personality', 'philosophical');
    this.set('speech_style', 'scholarly');
    this.set('chat_chance', 25);
    this.set('chat_msg', [
      '枯禅法师闭目端坐，嘴唇微动，不知是念经还是自语。',
      '枯禅法师伸手拨了拨油灯灯芯，火苗摇曳了一下又稳住。',
      '枯禅法师睁开一只眼看了看天色，又闭上了。',
    ]);
    this.set('inquiry', {
      寺院: '枯禅法师平静道：「这里佛道共处过百年，最后一起化作灰烬。信什么不重要，信了之后做什么才重要。」',
      修行: '枯禅法师道：「修行不在庙里，在心里。庙塌了，心不塌就行。」',
      default:
        '枯禅法师微微点头：「施主请坐。有话慢慢说，这里不缺时间。」',
    });
  }
}
