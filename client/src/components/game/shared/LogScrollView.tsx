/**
 * LogScrollView — FlatList 虚拟化日志视图（共享组件）
 *
 * 替代 ScrollView 全量渲染，支持：
 * - FlatList 虚拟化（几千条无卡顿）
 * - 智能自动滚动（底部跟随 / 历史查看 / 新消息浮标）
 * - 自适应行高（长文本自动换行）
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useGameStore, type LogEntry } from '../../../stores/useGameStore';
import { RichText } from '../../RichText';

/** 底部判定容差 */
const BOTTOM_THRESHOLD = 90;

interface LogScrollViewProps {
  style?: ViewStyle;
  /** FlatList 内容底部内边距（避免被同级元素遮挡） */
  contentPaddingBottom?: number;
}

/** 单条日志渲染（React.memo 避免重渲染） */
const LogItem = React.memo(({ item }: { item: LogEntry }) => (
  <View style={s.itemContainer}>
    <RichText text={item.text} style={{ ...s.text, color: item.color }} />
  </View>
));

export const LogScrollView = ({
  style,
  contentPaddingBottom,
}: LogScrollViewProps) => {
  const gameLog = useGameStore(state => state.gameLog);
  const flatListRef = useRef<FlatList<LogEntry>>(null);
  const isAtBottomRef = useRef(true);
  const lastLogCountRef = useRef(gameLog.length);
  /** 记录有滚动请求但 FlatList 不可见未能执行 */
  const pendingScrollRef = useRef(false);
  /** 上一次 onLayout 的高度，用于检测"从不可见变为可见" */
  const lastLayoutHeightRef = useRef(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  /** 将是否贴底状态写入 ref，避免异步 state 误判 */
  const setBottomState = useCallback((atBottom: boolean) => {
    isAtBottomRef.current = atBottom;
    if (atBottom) {
      setHasNewMessage(false);
    }
  }, []);

  /** 安排滚动到底部（双帧，等待多行文本完成布局） */
  const scheduleScrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated });
      });
    });
  }, []);

  /** 滚动事件 — 判断是否在底部 */
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      // 内容比视口小时始终视为贴底
      if (contentSize.height <= layoutMeasurement.height) {
        setBottomState(true);
        return;
      }
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const atBottom = distanceFromBottom <= BOTTOM_THRESHOLD;
      setBottomState(atBottom);
    },
    [setBottomState],
  );

  /** 内容高度变化：贴底时继续跟随到底部 */
  const handleContentSizeChange = useCallback(() => {
    if (isAtBottomRef.current) {
      scheduleScrollToEnd(true);
    }
  }, [scheduleScrollToEnd]);

  /** 兜底：日志条数变化时，按贴底状态决定自动滚动或显示新消息 */
  useEffect(() => {
    const prevCount = lastLogCountRef.current;
    if (gameLog.length === prevCount) return;
    const appended = gameLog.length > prevCount;
    lastLogCountRef.current = gameLog.length;

    if (!appended) return;
    if (isAtBottomRef.current) {
      pendingScrollRef.current = true;
      scheduleScrollToEnd(true);
    } else {
      setHasNewMessage(true);
    }
  }, [gameLog.length, scheduleScrollToEnd]);

  /** 页面重新获焦时：补偿隐藏期间未能执行的滚动 */
  useFocusEffect(
    useCallback(() => {
      if (isAtBottomRef.current) {
        pendingScrollRef.current = false;
        scheduleScrollToEnd(false);
      }
    }, [scheduleScrollToEnd]),
  );

  /** 点击浮标 → 滚动到底部 */
  const scrollToBottom = useCallback(() => {
    setBottomState(true);
    scheduleScrollToEnd(true);
  }, [scheduleScrollToEnd, setBottomState]);

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
        onLayout={e => {
          const { height } = e.nativeEvent.layout;
          const wasHidden = lastLayoutHeightRef.current === 0 && height > 0;
          const becameVisible =
            lastLayoutHeightRef.current !== height && height > 0;
          lastLayoutHeightRef.current = height;

          // 组件变为可见或尺寸变化时，补偿之前未执行的滚动
          if (
            (wasHidden || becameVisible || pendingScrollRef.current) &&
            isAtBottomRef.current
          ) {
            pendingScrollRef.current = false;
            scheduleScrollToEnd(false);
          }
        }}
        scrollEventThrottle={100}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={
          contentPaddingBottom
            ? { paddingBottom: contentPaddingBottom }
            : undefined
        }
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
