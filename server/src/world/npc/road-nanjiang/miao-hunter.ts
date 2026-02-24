/**
 * 苗人猎户 — 山路·蛮疆段
 * 在猎户棚屋歇脚的苗族猎人，态度友善，可以询问路况
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MiaoHunter extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '苗人猎户');
    this.set('short', '一个皮肤黝黑的苗族猎人');
    this.set(
      'long',
      '一个三十来岁的苗族汉子，皮肤晒得黝黑发亮，身材精瘦却筋肉分明。' +
        '他穿着一件染成靛蓝色的短衫，腰间缠着麻布绑腿，' +
        '脚蹬一双草鞋，鞋底磨得只剩薄薄一层。' +
        '背上斜挎着一张竹弓和一筒箭，腰后别着一把开山的短弯刀。' +
        '他的眼睛又黑又亮，在棚屋的阴影里像两颗湿润的石子，' +
        '时不时朝林子里张望一眼，是常年在山里讨生活的人才有的警觉。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '苗寨猎户');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 380);
    this.set('hp', 380);
    this.set('combat_exp', 0);
    this.set('personality', 'friendly');
    this.set('speech_style', 'plain');
    this.set('chat_chance', 8);
    this.set('chat_msg', [
      '苗人猎户往火塘里添了两根柴，火苗跳了跳，棚屋里暖和了些。',
      '苗人猎户从腰间取下水囊灌了一口，抹了抹嘴，望向远处的山峦。',
      '苗人猎户用短刀削着一根竹签，手法利落，像是在做陷阱的机关。',
      '苗人猎户忽然侧耳细听，片刻后松了口气，"是麂子，不碍事。"',
    ]);
    this.set('inquiry', {
      default:
        '"你是从北边来的？"苗人猎户抬头打量了你一眼，"往南走小心瘴气，' +
        '鼻子上蒙块湿布能好些。到了乱石坡脚踩实了再迈步，那儿蝮蛇多，' +
        '踩到石缝里的就麻烦了。"',
      route:
        '"从这儿到雾岚寨还有小半天的路。"苗人猎户指了指南边，' +
        '"翻过前头那道坡，走上石阶就快到了。寨子里的人不怎么待见外人，' +
        '但只要你不惹事，买卖还是做得的。"',
      hunt:
        '"山里有的是好东西——麂子、野猪、锦鸡，还有药材。"' +
        '苗人猎户拍了拍背上的竹弓，"不过蛮疆的林子跟中原不一样，' +
        '这里的虫子毒、蛇多、瘴气重，没有本地人带路，进深林就是送命。"',
      miasma:
        '"瘴气？那东西说怕也怕，说不怕也不怕。"苗人猎户从怀里掏出一小撮干草，' +
        '"这是苍术，点着了熏一熏能驱瘴。你要是没有，我这里匀你一点。"',
    });
  }
}
