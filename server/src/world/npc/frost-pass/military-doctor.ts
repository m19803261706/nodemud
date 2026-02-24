/**
 * 军医陆沉 — 朔云关·伤兵营
 * 白发老军医，医术精湛，在边关救人无数，性格温厚但疲惫
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MilitaryDoctor extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '陆沉');
    this.set('short', '一位白发苍苍、手上沾着药汁的老军医');
    this.set(
      'long',
      '年过花甲，头发全白，却束得一丝不苟。' +
        '一双手骨节粗大，指尖常年被药汁染成褐色，' +
        '但动作依然稳定而精准，缝合伤口时连眼皮都不眨一下。' +
        '身上的白衫已洗得发灰，袖口和前襟有血渍怎么也洗不掉。' +
        '他说话慢条斯理，声音低沉而温和，' +
        '像是怕惊扰了正在休息的伤员。' +
        '据说他年轻时是江南某家医馆的坐堂大夫，' +
        '因故来到北境，一待就是三十年。' +
        '伤兵营里的每个人都叫他"陆先生"，' +
        '在这里，他比关令还受人尊敬。',
    );
    this.set('title', '军医');
    this.set('gender', 'male');
    this.set('faction', Factions.CHENG_TIAN);
    this.set('visible_faction', '承天朝');
    this.set('attitude', 'friendly');
    this.set('level', 10);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('personality', 'warm');
    this.set('speech_style', 'formal');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '陆沉弯腰检查一个伤兵的绷带，轻声说道：「伤口在收口了，别乱动。」',
      '陆沉在药炉前搅动药汤，若有所思地叹了口气，又低下头继续忙碌。',
      '陆沉翻开一本泛黄的医书，用毛笔在某处批注了几个字，然后合上书，闭目养神片刻。',
    ]);
    this.set('inquiry', {
      伤势: '陆沉放下手中的纱布，看你一眼：「你要是受了伤，坐下让我看看。刀伤、箭创、冻伤，这里什么都见过。不过药材越来越少了，我尽力而为。」',
      药材: '陆沉叹了口气：「北境不比江南，药材全靠南边运来，路途遥远，损耗极大。去年冬天有一批药材被雪崩埋了，到现在都没补上缺口。最缺的是止血散和续骨膏，你要是在外面碰到了，带些回来，我收。」',
      default: '陆沉头也不抬地说：「坐下等着，前面还有三个人。」',
    });
  }
}
