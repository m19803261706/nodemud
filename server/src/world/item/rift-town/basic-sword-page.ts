/**
 * 基础剑法残页 — 酒馆角落遗落的秘籍
 * 记载基础剑法招式的残缺书页
 */
import { BookBase } from '../../../engine/game-objects/book-base';

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
    this.set('skill_name', '基础剑法');
    this.set('weight', 0);
    this.set('value', 100);
  }
}
