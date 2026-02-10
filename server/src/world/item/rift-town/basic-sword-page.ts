/**
 * 基础剑法残页 — 酒馆角落遗落的秘籍
 * 记载基础剑法招式的残缺书页，可通过 study 命令研读学习
 */
import { BookBase } from '../../../engine/game-objects/book-base';
import { BookType } from '@packages/core';

export default class BasicSwordPage extends BookBase {
  static virtual = false;

  create() {
    this.set('name', '基础剑法残页');
    this.set('short', '一张泛黄的残页');
    this.set(
      'long',
      '一张泛黄的纸页，边缘已经破损，上面用蝇头小楷写满了剑法口诀和招式图解。虽然只是残页，但对初学剑术者来说已是难得的参考。',
    );
    this.set('type', 'book');
    this.set('weight', 0);
    this.set('value', 100);

    // 书籍类型：技能秘籍
    this.set('book_type', BookType.SKILL);

    // 技能属性
    this.set('skill/name', '基础剑法');
    this.set('skill/skill_id', 'jiben-jianfa');
    this.set('skill/difficulty', 10);
    this.set('skill/jing_cost', 5);
    this.set('skill/min_level', 0);
    this.set('skill/max_level', 20);
  }
}
