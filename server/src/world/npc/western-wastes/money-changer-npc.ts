/**
 * 钱庄掌柜库尔班 — 黄沙驿·钱庄
 * 精明的货币兑换商，各国钱币无一不识
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';

export default class MoneyChangerNpc extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '库尔班');
    this.set('short', '一个正在拨弄天平的钱庄掌柜');
    this.set(
      'long',
      '他矮矮胖胖，脑袋圆圆的，戴着一顶绣花小帽。' +
        '眼睛很小，但一看到钱币就放大一圈，精光四射。' +
        '面前摆着天平、砝码和十几种不同的钱币，他的手指在其中穿梭，' +
        '拿起一枚弹一弹，放到天平上称一称，然后以极快的速度翻到账本的某一页做记录。' +
        '他能分辨出七个国家的货币真伪，' +
        '甚至能从磨损程度判断一枚铜钱在市面上流通了多久。' +
        '做生意时笑眯眯的，但汇率算得精确到小数点后两位，半文钱都不会让你。',
    );
    this.set('title', '掌柜');
    this.set('gender', 'male');
    this.set('faction', Factions.XI_YU);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 11);
    this.set('max_hp', 360);
    this.set('hp', 360);
    this.set('personality', 'shrewd');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 30);
    this.set('chat_msg', [
      '库尔班用指甲弹了弹一枚金币，侧耳听声音，满意地点了点头。',
      '库尔班翻着厚厚的账本，嘴里念念有词，手指飞快地在算盘上拨动。',
      '库尔班把一枚可疑的铜钱丢进醋里，看它冒不冒泡，用来辨别真伪。',
      '库尔班笑眯眯地把一叠钱币码得整整齐齐，每摞都是一百枚，一枚不差。',
    ]);
    this.set('inquiry', {
      兑换: '库尔班笑眯眯地搓着手：「承天朝的铜钱？有有有。一两银子换一千文，手续费三十文。你要是换十两以上，手续费打八折。」',
      假币: '库尔班脸色一沉：「假币？」他拿起一枚铜钱弹了弹，「听声音，真币清脆，假币发闷。再看做工——真币的字口深，假币浅。这些年假币越来越多，你自己当心。」',
      行情: '库尔班凑近了说：「最近西域金币涨了一成，因为草原那边打仗，金子都被军饷吃掉了。你要是有闲钱，现在买金子准没错。」',
      default: '库尔班堆着笑：「换钱？存钱？借钱？——最后一个是玩笑，我不放贷。你说吧，什么需要？」',
    });
  }
}
