/**
 * LogScrollView — FlatList 虚拟化日志视图（共享组件）
 *
 * 替代 ScrollView 全量渲染，支持：
 * - FlatList 虚拟化（几千条无卡顿）
 * - 智能自动滚动（底部跟随 / 历史查看 / 新消息浮标）
 * - 自适应行高（长文本自动换行）
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useGameStore, type LogEntry } from '../../../stores/useGameStore';
import { RichText } from '../../RichText';

/** 底部判定容差 */
const BOTTOM_THRESHOLD = 50;

interface LogScrollViewProps {
  style?: ViewStyle;
}

/** 单条日志渲染（React.memo 避免重渲染） */
const LogItem = React.memo(({ item }: { item: LogEntry }) => (
  <View style={s.itemContainer}>
    <RichText text={item.text} style={{ ...s.text, color: item.color }} />
  </View>
));

export const LogScrollView = ({ style }: LogScrollViewProps) => {
  const gameLog = useGameStore(state => state.gameLog);
  const flatListRef = useRef<FlatList<LogEntry>>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  /** 滚动事件 — 判断是否在底部 */
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

  /** 内容变化时：在底部则自动滚动，不在底部则显示浮标 */
  const handleContentSizeChange = useCallback(() => {
    if (isAtBottom) {
      flatListRef.current?.scrollToEnd({ animated: true });
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

  const keyExtractor = useCallback((item: LogEntry) => String(item.id), []);

  return (
    <View style={[s.container, style]}>
      <FlatList
        ref={flatListRef}
        data={gameLog}
        renderItem={({ item }) => <LogItem item={item} />}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={100}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      {hasNewMessage && (
        <TouchableOpacity style={s.newMsgBadge} onPress={scrollToBottom}>
          <Text style={s.newMsgText}>新消息</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
