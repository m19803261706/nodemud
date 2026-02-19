/**
 * 遗迹商白狐 — 黄沙驿·集市
 * 专营太古遗迹文物的商人，来路不明，眼光毒辣，狡黠善谈
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class RelicTrader extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '白狐');
    this.set('short', '一个正在翻看古物的商人');
    this.set(
      'long',
      '他看上去三十多岁，但眼神里有一种老者才有的精明。' +
        '头发半白，因此得了个「白狐」的绰号，他自己也不介意，反而觉得这名字有气势。' +
        '面前的箱子里摆着各种古物：玉器、金饰、刻着奇怪纹样的石片，' +
        '还有几样说不清用途的器物，全都用细布包好，轻拿轻放。' +
        '他惯于把一件东西拿起来对着光照，眯着眼睛看，' +
        '那一刻他的神情是认真的，其余时候都带着一种有点漫不经心的算计。' +
        '他游走在各处废墟之间，倒卖古物为生，胆子和运气都大得出奇。',
    );
    this.set('title', '');
    this.set('gender', 'male');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 16);
    this.set('max_hp', 600);
    this.set('hp', 600);
    this.set('personality', 'cunning');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '白狐把一件古物翻来覆去地看，嘴里低声嘀咕着估价，满脸认真。',
      '白狐对着光线仔细端详一件玉器，眯着眼睛，把玉举过头顶。',
      '白狐把一件东西小心放进布袋，然后若无其事地整了整摆在面前的古物，顺序摆得整整齐齐。',
      '白狐抬起头，打量了你一眼，目光在你身上停了一秒，似乎在评估某种价值。',
    ]);
    this.set('inquiry', {
      遗迹: '白狐低声道：「哪处还没被搜刮干净？」他停顿，「这得看你出什么价。好的路线图可不便宜，死人才便宜。」',
      太古: '白狐把玩着一块刻着纹样的石片：「太古纪的东西……真品无价，赝品也不便宜。」他笑了笑，「问题是你怎么分辨真假？靠我的眼力，当然。」',
      买卖: '白狐道：「这世上只有两种生意，一种是你骗我，一种是我骗你。我做的是第三种——大家都觉得自己没吃亏的那种。」',
      白狐: '他眯起眼睛打量你：「你找我什么事？先说来意，再说价钱。」',
      default: '白狐眯着眼睛，打量你上上下下，最后慢悠悠开口：「你身上有没有什么老物件？哪怕只是觉得有点奇怪的东西，拿出来让我看看。」',
    });
  }
}
