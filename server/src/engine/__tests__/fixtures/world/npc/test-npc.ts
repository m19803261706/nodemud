/**
 * 测试用克隆蓝图 - NPC
 */
import { BaseEntity } from '../../../../base-entity';

export default class TestNpc extends BaseEntity {
  static virtual = false;

  create() {
    this.set('name', '测试NPC');
    this.set('hp', 100);
  }
}
