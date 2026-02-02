/**
 * 测试用虚拟蓝图 - 房间
 */
import { BaseEntity } from '../../../../base-entity';

export default class TestRoom extends BaseEntity {
  static virtual = true;

  create() {
    this.set('short', '测试房间');
    this.set('type', 'room');
  }
}
