/**
 * SectEmptyState -- 未加入门派时的空状态页面
 * 水墨风居中提示，引导玩家寻找师父拜师
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SectEmptyState = () => {
  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>你尚未加入任何门派</Text>
        <Text style={s.subtitle}>
          江湖中各大宗门各有传承，寻找愿意收你为徒的师父，向其拜师即可入门。
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    borderRadius: 6,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    lineHeight: 20,
    textAlign: 'center',
  },
});
