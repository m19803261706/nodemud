/**
 * 芦笙手阿朵 — 雾岚寨·芦笙坪
 * 寨中最好的芦笙乐手，性格开朗，爱凑热闹
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class LushengPlayer extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '阿朵');
    this.set('short', '一个抱着芦笙的年轻人');
    this.set(
      'long',
      '他是个精瘦的年轻小伙，黑亮的皮肤，牙齿却白得耀眼。' +
        '头上缠着一条绣花布巾，几缕碎发从布巾下钻出来，显得有些不修边幅。' +
        '他怀里抱着一把六管芦笙，铜管擦得锃亮，看得出是他最宝贝的东西。' +
        '他一会儿用手指在管口上比划，一会儿凑近嘴边试吹两声，' +
        '曲调断断续续的，却有一种山野间独有的自在和欢快。' +
        '他闲不住，见到人就笑嘻嘻地打招呼，是寨中人缘最好的小伙子之一。',
    );
    this.set('title', '芦笙手');
    this.set('gender', 'male');
    this.set('faction', Factions.BAI_MAN);
    this.set('visible_faction', '雾岚寨');
    this.set('attitude', 'friendly');
    this.set('level', 8);
    this.set('max_hp', 300);
    this.set('hp', 300);
    this.set('personality', 'cheerful');
    this.set('speech_style', 'crude');
    this.set('chat_chance', 40);
    this.set('chat_msg', [
      '阿朵鼓起腮帮子吹了一段欢快的曲子，芦笙声在山间回荡，惹得几只鸟儿也跟着叫起来。',
      '阿朵用袖子仔细擦拭着芦笙的铜管，像在擦拭一件珍宝。',
      '阿朵靠在栏杆上，哼着一首苗家山歌，调子懒洋洋的，像午后的日头一样慵懒。',
      '阿朵对着远处的山头吹了一声长音，山谷里传来隐约的回响，他咧嘴笑了。',
    ]);
    this.set('inquiry', {
      芦笙: '阿朵眼睛一亮，拍了拍怀里的芦笙：「这个？我阿爷传给我的！六管的，声音比别人的都响。你要听不？我给你吹一段！」他说着就凑近了嘴。',
      寨子: '阿朵往四周一指：「咱们寨子好啊！山上有猎物，河里有鱼，地里有粮食，逢年过节还有跳月——你来了就知道了，跳月的时候，整座山都在抖！」',
      武功: '阿朵挠挠头：「武功我不行，我就会吹芦笙。不过魁蛙哥厉害，他一箭能射中百步外的山雀。你要学武，找他去。」',
      default: '阿朵笑嘻嘻地冲你招招手：「嘿，外面来的朋友！坐坐坐，我给你吹一首迎客曲！」',
    });
  }
}
