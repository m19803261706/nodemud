/**
 * 游戏主页 — 纯布局容器，组合各区域组件
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayerStats } from '../components/game/PlayerStats';
import { LocationHeader } from '../components/game/LocationHeader';
import { GameLog } from '../components/game/GameLog';
import { ChatPanel } from '../components/game/ChatPanel';
import { MapNavigation } from '../components/game/MapNavigation';
import { NpcList } from '../components/game/NpcList';
import { BottomNavBar } from '../components/game/BottomNavBar';

export const GameHomeScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();

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
        <LocationHeader />
        <View style={s.mainContent}>
          <View style={s.leftPanel}>
            <GameLog />
            <ChatPanel />
            <MapNavigation />
          </View>
          <NpcList />
        </View>
        <BottomNavBar />
      </View>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
});
