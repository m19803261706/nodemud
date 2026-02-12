/**
 * MapModal — 区域地图弹窗
 * 全屏覆盖展示当前区域地图，含房间节点、连线和图例
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import type { MapRoom } from '@packages/core';
import { useGameStore } from '../../../stores/useGameStore';
import { useUI } from '../../UIProvider';
import { wsService } from '../../../services/WebSocketService';
import LinearGradient from '../../LinearGradient';
import { MapCanvas } from './MapCanvas';
import { MapLegend } from './MapLegend';

export const MapModal = () => {
  const mapVisible = useGameStore(state => state.mapVisible);
  const mapData = useGameStore(state => state.mapData);
  const setMapVisible = useGameStore(state => state.setMapVisible);
  const { showAlert } = useUI();

  /** 关闭弹窗 */
  const handleClose = () => {
    setMapVisible(false);
  };

  /** 点击房间节点 → 确认导航 */
  const handleRoomPress = (room: MapRoom) => {
    if (room.isCurrent) return;

    showAlert({
      type: 'success',
      title: '前往目的地',
      message: `确定前往「${room.name}」？`,
      buttons: [
        { text: '取消' },
        {
          text: '前往',
          onPress: () => {
            wsService.send({
              type: 'navigateRequest',
              data: { targetRoomId: room.roomId },
              timestamp: Date.now(),
            });
            setMapVisible(false);
          },
        },
      ],
    });
  };

  if (!mapVisible || !mapData) return null;

  return (
    <Modal
      visible={mapVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <View style={s.card}>
          {/* 渐变背景 */}
          <LinearGradient
            colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={s.borderOverlay} pointerEvents="none" />

          {/* 标题栏 */}
          <View style={s.header}>
            <Text style={s.title}>{mapData.areaName}</Text>
            <TouchableOpacity
              style={s.closeBtn}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={s.closeBtnText}>关闭</Text>
            </TouchableOpacity>
          </View>

          {/* 分隔线 */}
          <LinearGradient
            colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
            style={s.divider}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />

          {/* 地图画布 */}
          <MapCanvas
            rooms={mapData.rooms}
            currentRoomId={mapData.currentRoomId}
            onRoomPress={handleRoomPress}
          />

          {/* 图例 */}
          <MapLegend />
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: '75%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#8B7A5A60',
  },
  closeBtnText: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
  },
  divider: {
    width: '100%',
    height: 1,
  },
});
