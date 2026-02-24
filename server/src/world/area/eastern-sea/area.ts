/**
 * 潮汐港 — 区域定义
 * 半合法港口半海盗窝，没有一面官方旗帜
 * 22 间房，15 个 NPC
 */
import { Area } from '../../../engine/game-objects/area';

export default class EasternSeaArea extends Area {
  static virtual = true;

  create() {
    this.set('name', '潮汐港');
    this.set('description', '半合法港口半海盗窝，没有一面官方旗帜');
    this.set('region', '东海·岛屿');
    this.set('level_range', { min: 15, max: 22 });
    this.set('rooms', [
      // --- 港口入口与北区 ---
      'area/eastern-sea/rope-bridge',       // (0,-1,0)  绳桥栈道
      'area/eastern-sea/harbor-gate',       // (0,0,0)   港口入口
      'area/eastern-sea/shipyard',          // (1,0,0)   船坞
      'area/eastern-sea/net-workshop',      // (2,0,0)   渔网作坊
      'area/eastern-sea/lighthouse',        // (1,-1,0)  破旧灯塔
      // --- 中心商业区 ---
      'area/eastern-sea/harbor-square',     // (0,1,0)   鱼市广场
      'area/eastern-sea/wharf',             // (1,1,0)   远航码头
      'area/eastern-sea/fishing-dock',      // (2,1,0)   渔人栈桥
      'area/eastern-sea/shipwreck-graveyard', // (3,1,0) 沉船墓地
      'area/eastern-sea/harbor-inn',        // (-1,1,0)  海风客栈
      'area/eastern-sea/drunk-alley',       // (-2,1,0)  醉汉巷
      // --- 南区·商业与居住 ---
      'area/eastern-sea/tavern',            // (0,2,0)   鲸吞酒馆
      'area/eastern-sea/blade-street',      // (1,2,0)   刀锋街
      'area/eastern-sea/salt-flat',         // (2,2,0)   晒盐场
      'area/eastern-sea/sailor-dorm',       // (-1,2,0)  水手宿舍
      'area/eastern-sea/watchtower',        // (-2,2,0)  瞭望塔
      // --- 深处·黑市与地下 ---
      'area/eastern-sea/black-market',      // (0,3,0)   黑市
      'area/eastern-sea/gambling-den',      // (1,3,0)   骰子赌坊
      'area/eastern-sea/freshwater-well',   // (-1,3,0)  淡水井
      'area/eastern-sea/pirate-den',        // (-2,3,0)  海盗窝
      'area/eastern-sea/smuggler-warehouse', // (0,4,0)  走私仓库
      'area/eastern-sea/arena',             // (-1,4,0)  斗兽场
      // --- 地下层 ---
      'area/eastern-sea/smuggler-tunnel',   // (0,4,-1)  走私密道
      'area/eastern-sea/treasure-cave',     // (1,4,-1)  藏宝洞
    ]);
    this.set('spawn_rules', [
      // === 友好/中立 NPC（interval: 0，不重生） ===
      {
        blueprintId: 'npc/eastern-sea/harbor-master',
        roomId: 'area/eastern-sea/harbor-square',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/immortal-ling',
        roomId: 'area/eastern-sea/wharf',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/doctor-qiu',
        roomId: 'area/eastern-sea/harbor-inn',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/shipwright-ma',
        roomId: 'area/eastern-sea/shipyard',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/fisherman-sun',
        roomId: 'area/eastern-sea/fishing-dock',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/tavern-keeper-jin',
        roomId: 'area/eastern-sea/tavern',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/info-broker-shen',
        roomId: 'area/eastern-sea/black-market',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/gambling-boss-yi',
        roomId: 'area/eastern-sea/gambling-den',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/smuggler-chen',
        roomId: 'area/eastern-sea/smuggler-warehouse',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/lookout-feng',
        roomId: 'area/eastern-sea/watchtower',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/arena-guard',
        roomId: 'area/eastern-sea/arena',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/salt-worker-li',
        roomId: 'area/eastern-sea/salt-flat',
        count: 1,
        interval: 0,
      },
      {
        blueprintId: 'npc/eastern-sea/lighthouse-hermit',
        roomId: 'area/eastern-sea/lighthouse',
        count: 1,
        interval: 0,
      },
      // === 敌对 NPC（interval: 120000，可重生） ===
      {
        blueprintId: 'npc/eastern-sea/pirate-thug',
        roomId: 'area/eastern-sea/blade-street',
        count: 2,
        interval: 120000,
      },
      {
        blueprintId: 'npc/eastern-sea/black-market-guard',
        roomId: 'area/eastern-sea/black-market',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/eastern-sea/drunk-alley-thief',
        roomId: 'area/eastern-sea/drunk-alley',
        count: 1,
        interval: 120000,
      },
      {
        blueprintId: 'npc/eastern-sea/pirate-captain-zhao',
        roomId: 'area/eastern-sea/pirate-den',
        count: 1,
        interval: 120000,
      },
    ]);
    this.set('item_spawn_rules', []);
  }
}
