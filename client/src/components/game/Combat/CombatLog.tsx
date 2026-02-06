/**
 * 战斗日志 -- 展示战斗动作记录
 * 使用 FlatList 虚拟列表 + 自动滚动 + RichText 渲染
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import type { CombatAction } from '@packages/core';
import { RichText } from '../../RichText';

/** 底部判定容差 */
const BOTTOM_THRESHOLD = 50;

interface CombatLogProps {
  actions: CombatAction[];
}

/** 带 id 的战斗动作（用于 FlatList key） */
interface CombatLogItem extends CombatAction {
  id: number;
}

/** 动作类型 → 颜色 */
function actionColor(action: CombatAction): string {
  if (action.type === 'crit') return '#A65D5D';
  if (action.type === 'miss') return '#8B7A5A';
  if (action.type === 'flee_fail') return '#B8860B';
  // 普通攻击：玩家深色，敌方浅色
  return action.attacker === 'player' ? '#3A3530' : '#6B5D4D';
}

/** 单条战斗日志渲染（React.memo 避免重渲染） */
const LogItem = React.memo(({ item }: { item: CombatLogItem }) => (
  <View style={s.itemContainer}>
    <RichText
      text={item.description}
      style={{ ...s.text, color: actionColor(item) }}
    />
  </View>
));

/** FlatList 头部（标题） */
const ListHeader = () => <Text style={s.title}>-- 战斗记录 --</Text>;

/** FlatList 空状态 */
const ListEmpty = () => <Text style={s.emptyText}>蓄力中...</Text>;

export const CombatLog = ({ actions }: CombatLogProps) => {
  const flatListRef = useRef<FlatList<CombatLogItem>>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  /** 给 actions 加上唯一 id */
  const items: CombatLogItem[] = actions.map((action, idx) => ({
    ...action,
    id: idx,
  }));

  /** 滚动事件 -- 判断是否在底部 */
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const atBottom =
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - BOTTOM_THRESHOLD;
      setIsAtBottom(atBottom);
      if (atBottom) setHasNewMessage(false);
    },
    [],
  );

  /** 内容变化时：在底部自动滚动，否则显示新消息浮标 */
  const handleContentSizeChange = useCallback(() => {
    if (isAtBottom) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    } else {
      setHasNewMessage(true);
    }
  }, [isAtBottom]);

  /** 点击浮标 → 滚动到底部 */
  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsAtBottom(true);
    setHasNewMessage(false);
  }, []);

  const keyExtractor = useCallback(
    (item: CombatLogItem) => String(item.id),
    [],
  );

  return (
    <View style={s.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={({ item }) => <LogItem item={item} />}
        keyExtractor={keyExtractor}
        extraData={actions.length}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={100}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        style={s.list}
      />
      {hasNewMessage && (
        <TouchableOpacity style={s.newMsgBadge} onPress={scrollToBottom}>
          <Text style={s.newMsgText}>新记录</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 11,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
    paddingVertical: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
    marginTop: 20,
  },
  itemContainer: {
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    lineHeight: 12 * 1.4,
    fontFamily: 'Noto Serif SC',
  },
  newMsgBadge: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    backgroundColor: '#8B7A5A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newMsgText: {
    color: '#F5F0E8',
    fontSize: 11,
    fontFamily: 'Noto Serif SC',
  },
});
