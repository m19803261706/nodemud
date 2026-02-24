/**
 * StationModal -- 驿站传送弹窗
 * 全屏覆盖展示天衍大陆城镇列表，已探索可传送，未探索灰色锁定
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import type { StationInfo } from '../../../stores/useGameStore';
import { useUI } from '../../UIProvider';
import { wsService } from '../../../services/WebSocketService';
import LinearGradient from '../../LinearGradient';
import { StationItem } from './StationItem';

export const StationModal = () => {
  const stationVisible = useGameStore(state => state.stationVisible);
  const stationData = useGameStore(state => state.stationData);
  const setStationVisible = useGameStore(state => state.setStationVisible);
  const { showAlert } = useUI();

  /** 关闭弹窗 */
  const handleClose = () => {
    setStationVisible(false);
  };

  /** 点击已探索城镇 → 确认传送 */
  const handleStationPress = (station: StationInfo) => {
    if (!station.isExplored || station.isCurrent) return;

    showAlert({
      type: 'success',
      title: '驿站传送',
      message: `确定要传送到「${station.name}」吗？`,
      buttons: [
        { text: '取消' },
        {
          text: '传送',
          onPress: () => {
            wsService.send({
              type: 'stationTeleportRequest',
              data: { targetAreaId: station.areaId },
              timestamp: Date.now(),
            });
          },
        },
      ],
    });
  };

  if (!stationVisible || !stationData) return null;

  return (
    <Modal
      visible={stationVisible}
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
            <Text style={s.title}>天衍驿站</Text>
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

          {/* 城镇列表 */}
          <FlatList
            data={stationData.stations}
            keyExtractor={item => item.areaId}
            renderItem={({ item }) => (
              <StationItem station={item} onPress={handleStationPress} />
            )}
            style={s.list}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
});
