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
/** z 轴层偏移（把上下层错开显示，避免节点重叠） */
const Z_LAYER_OFFSET = 0.45;

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

  // 计算坐标范围和像素映射（所有房间参与布局）
  const layout = useMemo(() => {
    if (rooms.length === 0) {
      return {
        positions: new Map<string, { px: number; py: number }>(),
        canvasWidth: 0,
        canvasHeight: 0,
      };
    }

    let minProjectedX = Infinity,
      maxProjectedX = -Infinity,
      minProjectedY = Infinity,
      maxProjectedY = -Infinity;

    const projected = new Map<string, { x: number; y: number }>();
    for (const r of rooms) {
      const { x, y, z = 0 } = r.coordinates;
      // 同层保持正交布局，上下楼层做轻微错位，避免节点完全重叠。
      const projectedX = x + z * Z_LAYER_OFFSET;
      const projectedY = y - z * Z_LAYER_OFFSET;
      projected.set(r.roomId, { x: projectedX, y: projectedY });

      if (projectedX < minProjectedX) minProjectedX = projectedX;
      if (projectedX > maxProjectedX) maxProjectedX = projectedX;
      if (projectedY < minProjectedY) minProjectedY = projectedY;
      if (projectedY > maxProjectedY) maxProjectedY = projectedY;
    }

    const positions = new Map<string, { px: number; py: number }>();
    for (const r of rooms) {
      const point = projected.get(r.roomId);
      if (!point) continue;
      positions.set(r.roomId, {
        px: (point.x - minProjectedX) * GRID_SIZE + CANVAS_PADDING,
        py: (point.y - minProjectedY) * GRID_SIZE + CANVAS_PADDING,
      });
    }

    const canvasWidth = (maxProjectedX - minProjectedX) * GRID_SIZE + CANVAS_PADDING * 2;
    const canvasHeight = (maxProjectedY - minProjectedY) * GRID_SIZE + CANVAS_PADDING * 2;

    return { positions, canvasWidth, canvasHeight };
  }, [rooms]);

  // 计算连线（去重，所有房间之间的连线都显示）
  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const roomIds = new Set(rooms.map(r => r.roomId));

    for (const room of rooms) {
      const from = layout.positions.get(room.roomId);
      if (!from) continue;

      for (const dir of room.exits) {
        const targetId = room.exitTargets[dir];
        if (!targetId || !roomIds.has(targetId)) continue;

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
  }, [rooms, layout]);

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

  if (rooms.length === 0) return null;

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
      {rooms.map(room => {
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
