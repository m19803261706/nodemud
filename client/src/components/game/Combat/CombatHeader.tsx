/**
 * 战斗头部 -- 显示双方名字和等级
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CombatHeaderProps {
  playerName: string;
  playerLevel: number;
  enemyName: string;
  enemyLevel: number;
}

export const CombatHeader = ({
  playerName,
  playerLevel,
  enemyName,
  enemyLevel,
}: CombatHeaderProps) => (
  <View style={s.container}>
    {/* 玩家方 */}
    <View style={s.side}>
      <Text style={s.name}>{playerName}</Text>
      <Text style={s.level}>Lv.{playerLevel}</Text>
    </View>

    {/* VS 分隔 */}
    <Text style={s.vs}>VS</Text>

    {/* 敌方 */}
    <View style={[s.side, s.enemySide]}>
      <Text style={s.name}>{enemyName}</Text>
      <Text style={s.level}>Lv.{enemyLevel}</Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
  },
  enemySide: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  level: {
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    marginTop: 2,
  },
  vs: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A65D5D',
    fontFamily: 'Noto Serif SC',
    marginHorizontal: 12,
  },
});
