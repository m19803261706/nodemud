/**
 * 玩家状态栏 — 顶部区域
 * 包含：名称徽章 + 3 进度条（气血/内力/精力） + 6 六维属性 + 攻防行 + 渐变分隔线
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import type { ResourceValue } from '../../../stores/useGameStore';
import { StatBar, GradientDivider } from '../shared';
import { PlayerNameBadge } from './PlayerNameBadge';
import { AttrValue } from './AttrValue';
import { CombatValue } from './CombatValue';

/** 六维属性标签映射 */
const ATTR_LABELS: {
  key: keyof ReturnType<typeof useGameStore.getState>['player']['attrs'];
  label: string;
}[] = [
  { key: 'wisdom', label: '慧根' },
  { key: 'perception', label: '心眼' },
  { key: 'spirit', label: '气海' },
  { key: 'meridian', label: '脉络' },
  { key: 'strength', label: '筋骨' },
  { key: 'vitality', label: '血气' },
];

/** 六维属性 key → equipBonus.attrs key 映射 */
const ATTR_BONUS_KEY: Record<string, string> = {
  wisdom: 'wisdom',
  perception: 'perception',
  spirit: 'spirit',
  meridian: 'meridian',
  strength: 'strength',
  vitality: 'vitality',
};

/** 资源值 → StatBar 百分比 */
function resourcePct(res: ResourceValue): number {
  return res.max > 0 ? Math.round((res.current / res.max) * 100) : 0;
}

/** 资源值 → StatBar 文本（max 为 0 时显示占位） */
function resourceText(res: ResourceValue): string {
  return res.max > 0 ? `${res.current}/${res.max}` : '--';
}

export const PlayerStats = () => {
  const player = useGameStore(state => state.player);

  /** 数据尚未到达（服务端未推送 playerStats） */
  const hasData = player.name.length > 0;

  /** 是否有任何攻防值 */
  const hasCombat = player.combat.attack > 0 || player.combat.defense > 0;
  const showMeta = hasCombat || player.silver > 0;

  return (
    <View style={s.container}>
      <PlayerNameBadge
        name={hasData ? player.name : '连接中…'}
        level={hasData ? player.level : ''}
      />

      {/* 第一行：气血/内力/精力 进度条 */}
      <View style={s.statsRow}>
        <StatBar
          label="气血"
          value={resourceText(player.hp)}
          pct={resourcePct(player.hp)}
          color="#A65D5D"
        />
        <StatBar
          label="内力"
          value={resourceText(player.mp)}
          pct={resourcePct(player.mp)}
          color="#4A6B6B"
        />
        <StatBar
          label="精力"
          value={resourceText(player.energy)}
          pct={resourcePct(player.energy)}
          color="#8B7355"
        />
      </View>

      {/* 第二行：六维属性数值 */}
      <View style={s.attrRow}>
        {ATTR_LABELS.map(({ key, label }) => {
          const bonusKey = ATTR_BONUS_KEY[key];
          const bonus =
            (player.equipBonus?.attrs as Record<string, number> | undefined)?.[
              bonusKey
            ] ?? 0;
          return (
            <AttrValue
              key={key}
              label={label}
              value={player.attrs[key]}
              bonus={bonus}
            />
          );
        })}
      </View>

      {/* 第三行：银两 + 攻防数值 */}
      {showMeta && (
        <View style={s.combatRow}>
          <CombatValue label="银两" value={player.silver} />
          {hasCombat ? <CombatValue label="攻击" value={player.combat.attack} /> : null}
          {hasCombat ? <CombatValue label="防御" value={player.combat.defense} /> : null}
        </View>
      )}

      <GradientDivider opacity={0.38} />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attrRow: {
    flexDirection: 'row',
    gap: 4,
  },
  combatRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 40,
  },
});
