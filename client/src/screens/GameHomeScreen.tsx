/**
 * 游戏主页 -- 纯布局容器，组合各区域组件
 * 背包 tab 时切换为全屏 InventoryPage
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../stores/useGameStore';
import { PlayerStats } from '../components/game/PlayerStats';
import { LocationHeader } from '../components/game/LocationHeader';
import { GameLog } from '../components/game/GameLog';
import { ChatPanel } from '../components/game/ChatPanel';
import { MapNavigation } from '../components/game/MapNavigation';
import { NpcList } from '../components/game/NpcList';
import { InventoryPage } from '../components/game/Inventory';
import { BottomNavBar } from '../components/game/BottomNavBar';

export const GameHomeScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const activeTab = useGameStore(state => state.activeTab);

  const isInventory = activeTab === '背包';

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
      locations={[0, 0.3, 0.6, 1]}
      style={s.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={[s.safeArea, { paddingTop: insets.top }]}>
        <PlayerStats />
        {isInventory ? (
          /* 背包全屏布局：替换 LocationHeader + mainContent */
          <View style={s.fullContent}>
            <InventoryPage />
          </View>
        ) : (
          /* 默认左右分栏布局 — 用 View 包裹避免 Fragment 导致 Fabric 视图回收崩溃 */
          <View style={s.defaultLayout}>
            <LocationHeader />
            <View style={s.mainContent}>
              <View style={s.leftPanel}>
                <GameLog />
                <ChatPanel />
                <MapNavigation />
              </View>
              <NpcList />
            </View>
          </View>
        )}
        <BottomNavBar />
      </View>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  defaultLayout: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  leftPanel: {
    flex: 17,
    gap: 10,
  },
  fullContent: {
    flex: 1,
    padding: 10,
  },
});
