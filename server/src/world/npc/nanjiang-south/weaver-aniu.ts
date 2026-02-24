/**
 * 织娘阿妞 — 雾岚寨·织染坊
 * 蜡染手艺人，温和话多，寨中人缘最好
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class WeaverAniu extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '阿妞');
    this.set('short', '一个正在描蜡染的苗族年轻女子');
    this.set(
      'long',
      '她二十出头的年纪，圆脸，眼睛弯弯的，总像在笑。' +
        '身着靛蓝色的对襟短衣，袖口和领口绣着精致的蝴蝶纹样，' +
        '那是她自己绣的，针脚细密得几乎看不出痕迹。' +
        '手指被靛蓝染料染成了深蓝色，怎么洗都洗不掉，但她毫不在意。' +
        '她弯腰在白布上用蜡刀描画，动作流畅自然，' +
        '蜡液在布面上化作一朵朵盛开的花，看得人出神。' +
        '她是寨子里人缘最好的姑娘，嘴甜手巧，谁家有喜事都来找她染布。',
    );
    this.set('title', '织娘');
    this.set('gender', 'female');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 250);
    this.set('hp', 250);
    this.set('personality', 'friendly');
    this.set('speech_style', 'casual');
    this.set('chat_chance', 50);
    this.set('chat_msg', [
      '阿妞哼着苗歌，手中蜡刀不停，旋律悠扬如山间清泉。',
      '阿妞抬头冲路过的人笑了笑，又低下头继续画她的蝴蝶。',
      '阿妞端详着自己刚染好的一块布，歪了歪头，似乎不太满意，又拿起蜡刀修改。',
      '阿妞把一匹染好的蓝布展开，在阳光下翻看，蓝底白花，煞是好看。',
    ]);
    this.set('inquiry', {
      蜡染: "阿妞眼睛一亮，放下蜡刀，兴致勃勃地说：「蜡染这门手艺，最讲究的是一个'活'字——你看这蜡纹，不能死板板地画，要像水一样流，像花一样开。我阿婆说，好的蜡染是有灵性的，它自己知道该往哪里走。」",
      寨子: '阿妞歪了歪头，认真地想了想：「我们寨子啊，其实挺好的。虽然外面的人觉得我们偏僻，可我觉得山上看云海，比城里看什么都好看。」',
      default: '阿妞停下手中的活，笑着打量你：「外面来的？坐嘛，我给你看看我新染的花样，好看得很嘞！」',
    });
  }
}
