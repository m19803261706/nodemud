/**
 * UseCommand use 指令 单元测试
 */
import { UseCommand } from '../../commands/std/use';
import { ItemBase } from '../../game-objects/item-base';
import { LivingBase } from '../../game-objects/living-base';
import { MedicineBase } from '../../game-objects/medicine-base';
import type { UseOption } from '../../game-objects/usable-item';

class FullHealMedicine extends MedicineBase {
  override getUseOptions(): UseOption[] {
    return [
      { key: 'default', label: '服用' },
      { key: 'full', label: '回满' },
    ];
  }

  override use(user: LivingBase, optionKey = 'default') {
    if (optionKey === 'full') {
      const maxHp = user.get<number>('max_hp') ?? 0;
      const hp = user.get<number>('hp') ?? 0;
      const hpRecovered = user.recoverHp(Math.max(0, maxHp - hp));
      return {
        success: true,
        message: '你催动药力，瞬间回满了气血。',
        consume: false,
        resourceChanged: hpRecovered > 0,
        data: { optionKey, hpRecovered },
      };
    }
    return super.use(user, optionKey);
  }
}

describe('UseCommand use 指令', () => {
  let command: UseCommand;
  let executor: LivingBase;

  async function give(item: ItemBase): Promise<void> {
    await item.moveTo(executor, { quiet: true });
  }

  beforeEach(() => {
    command = new UseCommand();
    executor = new LivingBase('test/player');
    executor.set('name', '测试玩家');
    executor.set('hp', 100);
    executor.set('max_hp', 100);
  });

  it('无参数时返回提示', () => {
    const result = command.execute(executor, []);
    expect(result.success).toBe(false);
    expect(result.message).toBe('使用什么？用法: use <物品名>');
  });

  it('药品使用后会恢复 HP 并被消耗', async () => {
    executor.set('hp', 40);
    const medicine = new MedicineBase('item/medicine/heal');
    medicine.set('name', '金疮药');
    medicine.set('heal_hp', 30);
    await give(medicine);

    const result = command.execute(executor, ['金疮药']);

    expect(result.success).toBe(true);
    expect(executor.get<number>('hp')).toBe(70);
    expect(result.data).toMatchObject({
      action: 'use',
      itemId: medicine.id,
      consumed: true,
      resourceChanged: true,
      hpRecovered: 30,
    });
    expect(executor.getInventory().includes(medicine)).toBe(false);
  });

  it('回血量会被 max_hp 上限钳制', async () => {
    executor.set('hp', 95);
    const medicine = new MedicineBase('item/medicine/heal-cap');
    medicine.set('name', '小还丹');
    medicine.set('heal_hp', 50);
    await give(medicine);

    const result = command.execute(executor, ['小还丹']);

    expect(result.success).toBe(true);
    expect(executor.get<number>('hp')).toBe(100);
    expect(result.data).toMatchObject({
      hpRecovered: 5,
      consumed: true,
      resourceChanged: true,
    });
  });

  it('支持自定义 optionKey 且可不消耗物品', async () => {
    executor.set('hp', 20);
    const medicine = new FullHealMedicine('item/medicine/full-heal');
    medicine.set('name', '九转灵丹');
    medicine.set('heal_hp', 10);
    await give(medicine);

    const result = command.execute(executor, ['九转灵丹', 'full']);

    expect(result.success).toBe(true);
    expect(executor.get<number>('hp')).toBe(100);
    expect(result.data).toMatchObject({
      optionKey: 'full',
      consumed: false,
      resourceChanged: true,
      hpRecovered: 80,
    });
    expect(executor.getInventory().includes(medicine)).toBe(true);
  });

  it('不可使用物品会返回失败', async () => {
    const sword = new ItemBase('item/misc/sword');
    sword.set('name', '木剑');
    await give(sword);

    const result = command.execute(executor, ['木剑']);

    expect(result.success).toBe(false);
    expect(result.message).toBe('木剑不能被使用。');
  });
});
