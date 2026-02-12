/**
 * MapCanvas — 地图画布
 * 将房间坐标转换为像素位置，渲染连线和房间节点
 * y 轴翻转：coordinates 中负数为北（屏幕上方）
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import type { MapRoom } from '@packages/core';
import { RoomNode, NODE_SIZE } from './RoomNode';

/** 网格间距（像素） */
const GRID_SIZE = 80;
/** 画布内边距 */
const CANVAS_PADDING = 60;

interface MapCanvasProps {
  rooms: MapRoom[];
  currentRoomId: string;
  onRoomPress?: (room: MapRoom) => void;
}

/** 连线组件 — 两个房间之间的路径线段 */
const RoomEdge = ({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1) || 2;
  const height = Math.abs(y2 - y1) || 2;

  return <View style={[s.edge, { left, top, width, height }]} />;
};

export const MapCanvas = ({
  rooms,
  currentRoomId,
  onRoomPress,
}: MapCanvasProps) => {
  const scrollRef = useRef<ScrollView>(null);

  // 仅展示已探索的房间
  const exploredRooms = useMemo(
    () => rooms.filter(r => r.isExplored),
    [rooms],
  );

  // 计算坐标范围和像素映射
  const layout = useMemo(() => {
    if (exploredRooms.length === 0) {
      return { positions: new Map<string, { px: number; py: number }>(), canvasWidth: 0, canvasHeight: 0 };
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const r of exploredRooms) {
      const { x, y } = r.coordinates;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const positions = new Map<string, { px: number; py: number }>();
    for (const r of exploredRooms) {
      const { x, y } = r.coordinates;
      // y 轴按世界坐标：y 越小越靠北（屏幕上方）
      positions.set(r.roomId, {
        px: (x - minX) * GRID_SIZE + CANVAS_PADDING,
        py: (y - minY) * GRID_SIZE + CANVAS_PADDING,
      });
    }

    const canvasWidth = (maxX - minX) * GRID_SIZE + CANVAS_PADDING * 2;
    const canvasHeight = (maxY - minY) * GRID_SIZE + CANVAS_PADDING * 2;

    return { positions, canvasWidth, canvasHeight };
  }, [exploredRooms]);

  // 计算连线（去重）
  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const exploredIds = new Set(exploredRooms.map(r => r.roomId));

    for (const room of exploredRooms) {
      const from = layout.positions.get(room.roomId);
      if (!from) continue;

      for (const dir of room.exits) {
        const targetId = room.exitTargets[dir];
        if (!targetId || !exploredIds.has(targetId)) continue;

        const to = layout.positions.get(targetId);
        if (!to) continue;

        // 去重：用排序后的 ID 组合作为 key
        const key =
          room.roomId < targetId
            ? `${room.roomId}-${targetId}`
            : `${targetId}-${room.roomId}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);

        result.push({ x1: from.px, y1: from.py, x2: to.px, y2: to.py });
      }
    }
    return result;
  }, [exploredRooms, layout]);

  // 初始滚动到当前位置居中
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const currentPos = layout.positions.get(currentRoomId);
    if (!currentPos || !scrollRef.current) return;

    // 延迟一帧确保 ScrollView 已渲染
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: Math.max(0, currentPos.px - screenWidth / 2),
        y: Math.max(0, currentPos.py - screenHeight / 3),
        animated: false,
      });
    });
  }, [currentRoomId, layout, screenWidth, screenHeight]);

  if (exploredRooms.length === 0) return null;

  return (
    <ScrollView
      ref={scrollRef}
      style={s.scroll}
      contentContainerStyle={{
        width: Math.max(layout.canvasWidth, screenWidth),
        height: Math.max(layout.canvasHeight, 300),
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      maximumZoomScale={2}
      minimumZoomScale={0.5}
    >
      {/* 连线层 */}
      {edges.map((edge, i) => (
        <RoomEdge key={`e-${i}`} {...edge} />
      ))}

      {/* 房间节点层 */}
      {exploredRooms.map(room => {
        const pos = layout.positions.get(room.roomId);
        if (!pos) return null;
        return (
          <RoomNode
            key={room.roomId}
            name={room.name}
            x={pos.px}
            y={pos.py}
            isCurrent={room.roomId === currentRoomId}
            isExplored={room.isExplored}
            onPress={() => onRoomPress?.(room)}
          />
        );
      })}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  edge: {
    position: 'absolute',
    backgroundColor: '#8B7A5A40',
  },
});
