/**
 * 客栈老板扎拉 — 黄沙驿·驿馆
 * 粗犷豪爽的西域女商人，驿馆的实际经营者
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class InnkeeperZara extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '扎拉');
    this.set('short', '一个正在擦桌子的粗壮西域女人');
    this.set(
      'long',
      '她身材高大壮实，比大多数男人都要魁梧，一头黑发用红布条扎在脑后。' +
        '面色红润，额头上有一道浅疤，据说是年轻时和沙匪拼命留下的纪念。' +
        '她穿着一件宽大的对襟长袍，袖子挽到肘部，露出结实的前臂。' +
        '说话嗓门极大，隔着三顶帐篷都能听到她在骂不付账的客人。' +
        '但她对正经旅客非常照顾，饭菜份量足，住宿价格公道，' +
        '遇到落难的行旅还会免费收留几天——当然，这份恩情她会记在账上。',
    );
    this.set('title', '掌柜');
    this.set('gender', 'female');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '黄沙驿');
    this.set('attitude', 'friendly');
    this.set('level', 14);
    this.set('max_hp', 520);
    this.set('hp', 520);
    this.set('personality', 'warmhearted');
    this.set('speech_style', 'blunt');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '扎拉一巴掌拍在桌子上，震得碗碟跳了起来：「不付钱就想走？门都没有！」',
      '扎拉给一个冻得发抖的旅人端了碗热汤，嘴上骂道：「喝完了赶紧去暖和！死在我店里算谁的？」',
      '扎拉用抹布使劲擦着桌子，一边擦一边哼着西域的歌谣，曲调悠扬。',
      '扎拉叉着腰站在门口，目光扫过每一个进来的客人，像是一头母狮巡视领地。',
    ]);
    this.set('inquiry', {
      住宿: '扎拉用抹布往肩上一搭：「住一晚五十文，包一顿早饭。要单间另加二十文。银子先付，走的时候查房。」',
      吃饭: '扎拉掰着手指头：「烤羊腿、手抓饭、奶茶、馕饼，要什么有什么。不过你要是吃不了辣，提前说，这里的厨子下手没轻没重。」',
      沙匪: '扎拉收了笑，压低声音：「最近沙匪又活跃了，北边的废营那一片，天黑了别去。我说真的。」',
      扎拉: '她双手叉腰：「我扎拉在这条路上开了二十年店，还没有人敢赖过我的账。你说我是什么人？」',
      default:
        '扎拉笑着拍拍你的肩膀，力气大得让人一个踉跄：「欢迎来到黄沙驿！饿了渴了只管说，扎拉的驿馆不会亏待客人。」',
    });
  }
}
