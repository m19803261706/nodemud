/**
 * 客栈老板 — 裂隙镇客栈
 * 热情的客栈老板娘，负责住宿和休息
 */
import { NpcBase } from '../../../engine/game-objects/npc-base';
import { Factions } from '@packages/core';
import type { PlayerBase } from '../../../engine/game-objects/player-base';
import { RoomBase } from '../../../engine/game-objects/room-base';

export default class Innkeeper extends NpcBase {
  static virtual = false;

  create() {
    this.set('name', '客栈老板');
    this.set('short', '一位笑容可掬的中年妇人');
    this.set(
      'long',
      '客栈老板是个四十出头的妇人，圆圆的脸上总挂着热情的笑容。' +
        '她嗓门大、手脚麻利，把客栈打理得干干净净。' +
        '南来北往的旅人都喜欢在她这里歇脚，' +
        '既因为这里的床铺干净，也因为她做的一手好菜。',
    );
    this.set('title', '裂隙镇');
    this.set('gender', 'female');
    this.set('faction', Factions.NONE);
    this.set('visible_faction', '');
    this.set('attitude', 'friendly');
    this.set('level', 12);
    this.set('max_hp', 400);
    this.set('hp', 400);
    this.set('personality', 'friendly');
    this.set('speech_style', 'merchant');
    this.set('chat_chance', 12);
    this.set('chat_msg', [
      '客栈老板正忙着整理桌上的碗筷。',
      '客栈老板哼着小曲擦拭着柜台。',
      '客栈老板朝路过的客人招了招手：「客官，要不要来碗热汤？」',
      '客栈老板吆喝店小二：「二楼的被褥该晒了，趁今天日头好。」',
    ]);
    this.set('inquiry', {
      住宿: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `客栈老板笑道：「${title}要住店？咱们这儿虽然比不上城里的大客栈，但胜在干净暖和。一晚上不贵，管饱一顿热饭。」`;
      },
      消息: '客栈老板想了想：「最近来住店的人比以前多了不少，好些都是从北边来的，说是北边不太平。具体的嘛，你去酒馆问问酒保，他消息最灵通。」',
      default: (asker) => {
        const title = this.getPlayerTitle(asker as PlayerBase);
        return `客栈老板歉意地笑笑：「${title}，这个我可说不上来，去别处打听打听吧。」`;
      },
    });
  }

  /** 玩家进入客栈时偶尔热情问候 */
  onPlayerEnter(player: PlayerBase): void {
    if (Math.random() > 0.1) return;
    const title = this.getPlayerTitle(player);
    const env = this.getEnvironment();
    if (env && env instanceof RoomBase) {
      env.broadcast(
        `[npc]${this.getName()}[/npc]热情地招呼道：「${title}，赶路辛苦了吧？先坐下歇歇脚，喝碗热汤暖暖身子。」`,
      );
    }
  }
}
