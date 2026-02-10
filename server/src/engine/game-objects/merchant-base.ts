/**
 * MerchantBase — 商人 NPC 基类
 *
 * 提供统一商店能力：
 * - 配置可售卖商品列表（shop_goods）
 * - 列表展示（list）
 * - 按序号/名称购买（buy）
 * - 按规则回收玩家物品（sell）
 */
import { ItemBase } from './item-base';
import { LivingBase } from './living-base';
import { NpcBase } from './npc-base';
import { ServiceLocator } from '../service-locator';

/** 商店商品配置 */
export interface ShopGoodConfig {
  blueprintId: string;
  /** 价格（银两）；未配置时回退到物品 value */
  price?: number;
  /**
   * 库存：
   * -1: 无限
   *  0: 已售罄
   * >0: 剩余数量
   */
  stock?: number;
  /** 可选覆盖名称（避免每次 list 预览 clone） */
  name?: string;
  /** 可选覆盖简述 */
  short?: string;
}

/** 列表展示条目 */
export interface ShopGoodView {
  index: number;
  blueprintId: string;
  name: string;
  short: string;
  price: number;
  stock: number;
}

/** 购买结果 */
export interface ShopBuyResult {
  success: boolean;
  message: string;
  data?: {
    action: 'buy';
    merchantId: string;
    merchantName: string;
    itemId?: string;
    itemName?: string;
    blueprintId?: string;
    price?: number;
    remainingSilver?: number;
    stockLeft?: number;
    moneyChanged?: boolean;
  };
}

/** 商人回收规则配置（按 NPC 可覆写） */
export interface ShopRecycleConfig {
  enabled?: boolean;
  /** 允许回收的类型白名单（为空表示不限制） */
  allowedTypes?: string[];
  /** 禁止回收的类型黑名单 */
  deniedTypes?: string[];
  /** 允许回收的蓝图 ID 前缀/完整匹配（为空表示不限制） */
  allowedBlueprints?: string[];
  /** 禁止回收的蓝图 ID 前缀/完整匹配 */
  deniedBlueprints?: string[];
  /** 回收比例（默认 0.5） */
  priceRate?: number;
  /** 最低回收价（默认 1） */
  minPrice?: number;
  /** 最高回收价（可选） */
  maxPrice?: number;
  /** 指定蓝图固定回收价 */
  explicitPrices?: Record<string, number>;
  /** 拒收提示（可选） */
  rejectionMessage?: string;
}

/** 卖出结果 */
export interface ShopSellResult {
  success: boolean;
  message: string;
  data?: {
    action: 'sell';
    merchantId: string;
    merchantName: string;
    itemId?: string;
    itemName?: string;
    itemType?: string;
    itemBlueprintId?: string;
    price?: number;
    remainingSilver?: number;
    moneyChanged?: boolean;
  };
}

export class MerchantBase extends NpcBase {
  static virtual = false;

  /** 获取商店配置 */
  getShopGoods(): ShopGoodConfig[] {
    const raw = this.get<ShopGoodConfig[]>('shop_goods');
    if (!Array.isArray(raw)) return [];
    return raw
      .map((good) => this.normalizeGood(good))
      .filter((good): good is ShopGoodConfig => !!good);
  }

  /** 生成可展示的商品列表 */
  getShopGoodViews(): ShopGoodView[] {
    const goods = this.getShopGoods();
    return goods.map((good, i) => {
      const meta = this.resolveGoodMeta(good);
      return {
        index: i + 1,
        blueprintId: good.blueprintId,
        name: meta.name,
        short: meta.short,
        price: meta.price,
        stock: good.stock ?? -1,
      };
    });
  }

  /** 购买商品（按序号或名称） */
  buyGood(buyer: LivingBase, selector: string): ShopBuyResult {
    const views = this.getShopGoodViews();
    if (views.length === 0) {
      return { success: false, message: `${this.getName()}摊了摊手：「小店暂无货物。」` };
    }

    const selected = this.findGoodBySelector(selector, views);
    if (!selected) {
      return { success: false, message: `${this.getName()}道：「没有这件货。」` };
    }

    if (selected.stock === 0) {
      return {
        success: false,
        message: `${this.getName()}摇头道：「${selected.name}已经卖完了。」`,
      };
    }

    const currentSilver = buyer.getSilver();
    if (currentSilver < selected.price) {
      return {
        success: false,
        message: `${this.getName()}道：「${selected.name}要${selected.price}两银子，你银两不够。」`,
      };
    }

    const item = this.cloneGoodsItem(selected.blueprintId);
    if (!item) {
      return { success: false, message: `${this.getName()}翻找半天：「这件货现在拿不出来。」` };
    }

    const paid = buyer.spendSilver(selected.price);
    if (!paid) {
      item.destroy();
      return { success: false, message: `${this.getName()}道：「你银两不够。」` };
    }

    item.moveTo(buyer, { quiet: true });
    const stockLeft = this.consumeStock(selected.index);
    const remainingSilver = buyer.getSilver();

    return {
      success: true,
      message: `你向${this.getName()}购买了${item.getName()}，花费${selected.price}两银子（剩余${remainingSilver}两）。`,
      data: {
        action: 'buy',
        merchantId: this.id,
        merchantName: this.getName(),
        itemId: item.id,
        itemName: item.getName(),
        blueprintId: selected.blueprintId,
        price: selected.price,
        remainingSilver,
        stockLeft,
        moneyChanged: true,
      },
    };
  }

  /** 获取回收规则（默认开启，回收价为物品 value 的 50%） */
  getRecycleConfig(): ShopRecycleConfig {
    const raw = this.get<ShopRecycleConfig>('shop_recycle');
    if (!raw || typeof raw !== 'object') {
      return { enabled: true, priceRate: 0.5, minPrice: 1 };
    }

    const normalizeList = (arr: unknown): string[] | undefined => {
      if (!Array.isArray(arr)) return undefined;
      return arr
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0);
    };

    const normalizeExplicitPrices = (input: unknown): Record<string, number> | undefined => {
      if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
      const result: Record<string, number> = {};
      for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        if (typeof key !== 'string' || typeof value !== 'number' || !Number.isFinite(value))
          continue;
        result[key] = Math.max(0, Math.floor(value));
      }
      return Object.keys(result).length > 0 ? result : undefined;
    };

    return {
      enabled: raw.enabled ?? true,
      allowedTypes: normalizeList(raw.allowedTypes),
      deniedTypes: normalizeList(raw.deniedTypes),
      allowedBlueprints: normalizeList(raw.allowedBlueprints),
      deniedBlueprints: normalizeList(raw.deniedBlueprints),
      priceRate: typeof raw.priceRate === 'number' ? Math.max(0, raw.priceRate) : 0.5,
      minPrice: typeof raw.minPrice === 'number' ? Math.max(0, Math.floor(raw.minPrice)) : 1,
      maxPrice:
        typeof raw.maxPrice === 'number' ? Math.max(0, Math.floor(raw.maxPrice)) : undefined,
      explicitPrices: normalizeExplicitPrices(raw.explicitPrices),
      rejectionMessage: typeof raw.rejectionMessage === 'string' ? raw.rejectionMessage : undefined,
    };
  }

  /** 卖出物品给商人 */
  sellItem(seller: LivingBase, item: ItemBase): ShopSellResult {
    if (!item.isTradeable()) {
      return { success: false, message: `${this.getName()}摇头道：「这东西不能交易。」` };
    }

    const rule = this.getRecycleConfig();
    if (!rule.enabled) {
      return { success: false, message: `${this.getName()}摆手道：「小店不收货。」` };
    }

    const blueprintId = this.getBlueprintId(item);
    const itemType = item.getType();

    const canRecycle = this.canRecycleByRule(item, blueprintId, rule);
    if (!canRecycle.ok) {
      const msg = rule.rejectionMessage || canRecycle.reason || `${this.getName()}不收这类东西。`;
      return { success: false, message: msg };
    }

    const price = this.resolveRecyclePrice(item, blueprintId, rule);
    if (price <= 0) {
      return { success: false, message: `${this.getName()}皱眉道：「这东西不值钱，不收。」` };
    }

    item.destroy();
    const remainingSilver = seller.addSilver(price);

    return {
      success: true,
      message: `你把${item.getName()}卖给了${this.getName()}，获得${price}两银子（现有${remainingSilver}两）。`,
      data: {
        action: 'sell',
        merchantId: this.id,
        merchantName: this.getName(),
        itemId: item.id,
        itemName: item.getName(),
        itemType,
        itemBlueprintId: blueprintId,
        price,
        remainingSilver,
        moneyChanged: true,
      },
    };
  }

  /** 规范化商品配置 */
  private normalizeGood(raw: ShopGoodConfig): ShopGoodConfig | null {
    if (!raw || typeof raw.blueprintId !== 'string' || raw.blueprintId.trim().length === 0) {
      return null;
    }
    const stockRaw = raw.stock;
    const stock =
      typeof stockRaw === 'number' ? (stockRaw < 0 ? -1 : Math.floor(stockRaw)) : undefined;
    const price = typeof raw.price === 'number' ? Math.max(1, Math.floor(raw.price)) : undefined;
    return {
      blueprintId: raw.blueprintId.trim(),
      stock,
      price,
      name: typeof raw.name === 'string' ? raw.name.trim() : undefined,
      short: typeof raw.short === 'string' ? raw.short.trim() : undefined,
    };
  }

  /** 解析商品展示元数据 */
  private resolveGoodMeta(good: ShopGoodConfig): { name: string; short: string; price: number } {
    if (good.name && good.short && good.price && good.price > 0) {
      return { name: good.name, short: good.short, price: good.price };
    }

    const preview = this.cloneGoodsItem(good.blueprintId);
    if (!preview) {
      return {
        name: good.name || good.blueprintId,
        short: good.short || '（未知货物）',
        price: good.price ?? 1,
      };
    }

    const name = good.name || preview.getName();
    const short = good.short || preview.getShort();
    const price = good.price ?? Math.max(1, preview.getValue());
    preview.destroy();
    return { name, short, price };
  }

  /** 按序号或名称查找商品 */
  private findGoodBySelector(selector: string, views: ShopGoodView[]): ShopGoodView | null {
    const input = selector.trim();
    if (!input) return null;

    const index = Number.parseInt(input, 10);
    if (Number.isInteger(index) && String(index) === input) {
      const byIndex = views.find((view) => view.index === index);
      if (byIndex) return byIndex;
    }

    const lowered = input.toLowerCase();
    const byName = views.find(
      (view) => view.name.includes(input) || view.name.toLowerCase() === lowered,
    );
    return byName ?? null;
  }

  /** 按规则判断是否可回收 */
  private canRecycleByRule(
    item: ItemBase,
    blueprintId: string,
    rule: ShopRecycleConfig,
  ): { ok: boolean; reason?: string } {
    const type = item.getType();
    const inList = (value: string, rules?: string[]): boolean => {
      if (!rules || rules.length === 0) return false;
      return rules.some((ruleValue) => value === ruleValue || value.startsWith(ruleValue));
    };

    if (inList(type, rule.deniedTypes)) {
      return { ok: false, reason: `${this.getName()}道：「这类东西我不收。」` };
    }
    if (inList(blueprintId, rule.deniedBlueprints)) {
      return { ok: false, reason: `${this.getName()}道：「这件货我不收。」` };
    }
    if (rule.allowedTypes && rule.allowedTypes.length > 0 && !rule.allowedTypes.includes(type)) {
      return { ok: false, reason: `${this.getName()}道：「我只收特定几类货。」` };
    }
    if (
      rule.allowedBlueprints &&
      rule.allowedBlueprints.length > 0 &&
      !inList(blueprintId, rule.allowedBlueprints)
    ) {
      return { ok: false, reason: `${this.getName()}道：「这件货不在我的收购范围。」` };
    }
    return { ok: true };
  }

  /** 计算回收价 */
  private resolveRecyclePrice(
    item: ItemBase,
    blueprintId: string,
    rule: ShopRecycleConfig,
  ): number {
    const explicit = rule.explicitPrices?.[blueprintId];
    if (typeof explicit === 'number') {
      return Math.max(0, Math.floor(explicit));
    }

    const baseValue = item.getValue();
    const rate = rule.priceRate ?? 0.5;
    const minPrice = rule.minPrice ?? 1;
    const maxPrice = rule.maxPrice;
    let price = Math.floor(baseValue * rate);
    if (price < minPrice) price = minPrice;
    if (typeof maxPrice === 'number') price = Math.min(price, maxPrice);
    return Math.max(0, price);
  }

  /** 消耗库存，返回剩余库存（-1 表示无限） */
  private consumeStock(index: number): number {
    const goods = this.getShopGoods();
    const target = goods[index - 1];
    if (!target) return -1;
    const stock = target.stock ?? -1;
    if (stock < 0) return -1;
    const next = Math.max(0, stock - 1);
    target.stock = next;
    this.set('shop_goods', goods);
    return next;
  }

  /** 从蓝图克隆商品 */
  private cloneGoodsItem(blueprintId: string): ItemBase | null {
    const factory = ServiceLocator.blueprintFactory;
    if (!factory) return null;
    try {
      const entity = factory.clone(blueprintId);
      if (entity instanceof ItemBase) return entity;
      entity.destroy();
      return null;
    } catch {
      return null;
    }
  }

  /** 从实例 ID 提取蓝图 ID */
  private getBlueprintId(item: ItemBase): string {
    return item.id.split('#')[0];
  }
}
