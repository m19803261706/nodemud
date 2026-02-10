/**
 * 应用根组件
 * 配置路由导航和 WebSocket 连接
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UIProvider } from './src/components';
import { wsService } from './src/services/WebSocketService';
import { useGameStore, exitsToDirections } from './src/stores/useGameStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { CreateCharacterScreen } from './src/screens/CreateCharacterScreen';
import { OriginSelectScreen } from './src/screens/OriginSelectScreen';
import { FateRevealScreen } from './src/screens/FateRevealScreen';
import { AttributeAllocateScreen } from './src/screens/AttributeAllocateScreen';
import { CharacterConfirmScreen } from './src/screens/CharacterConfirmScreen';
import { GameHomeScreen } from './src/screens/GameHomeScreen';
import CombatScreen from './src/screens/CombatScreen';

const WS_URL = 'ws://localhost:4000';
const Stack = createNativeStackNavigator();

/** 导航引用（用于 WebSocket 回调中的页面跳转） */
const navigationRef = createNavigationContainerRef();

/** 应用根组件 */
function App(): React.JSX.Element {
  // App 启动时建立 WebSocket 连接（类似 MUD 的 telnet 连接大厅）
  // 不在 cleanup 中断开，连接跟随进程生命周期而非组件生命周期
  useEffect(() => {
    if (!wsService.isConnected) {
      wsService.connect(WS_URL);
    }

    // 全局监听游戏消息（必须在连接建立时就注册，避免导航时丢消息）
    const handleRoomInfo = (data: any) => {
      const { setLocation, setDirections, setNpcs, setGroundItems, location } =
        useGameStore.getState();
      // 截取地点名（去掉区域前缀，如"裂隙镇·镇中广场" → "镇中广场"）
      const shortName = data.short?.includes('·')
        ? data.short.split('·').pop()!
        : data.short;
      setLocation({
        name: shortName,
        actions: location.actions,
        description: data.long,
      });
      setDirections(exitsToDirections(data.exits, shortName, data.exitNames));
      setNpcs(data.npcs ?? []);
      setGroundItems(data.items ?? []);
    };

    const handleInventoryUpdate = (data: any) => {
      useGameStore.getState().setInventory(data.items ?? []);
    };

    const handleCommandResult = (data: any) => {
      // NPC look 结果 → 弹窗展示
      if (
        data.success &&
        data.data?.action === 'look' &&
        data.data?.target === 'npc'
      ) {
        useGameStore.getState().setNpcDetail(data.data);
        return;
      }
      // 容器/物品 look 结果 → 物品详情弹窗
      if (
        data.success &&
        data.data?.action === 'look' &&
        (data.data?.target === 'container' || data.data?.target === 'item')
      ) {
        useGameStore.getState().setItemDetail(data.data);
        return;
      }
      // 有消息 → 写入日志（失败红色，成功默认色）
      if (data.message) {
        const { appendLog } = useGameStore.getState();
        const color = data.success ? '#3D3935' : '#8B3A3A';
        appendLog({ text: data.message, color });
      }
    };

    const handleMessage = (data: any) => {
      const content =
        typeof data === 'string' ? data : data?.content || data?.message;
      if (!content) return;
      useGameStore.getState().appendLog({ text: content, color: '#5A5048' });
    };

    const handlePlayerStats = (data: any) => {
      const { updatePlayer } = useGameStore.getState();
      updatePlayer({
        name: data.name,
        level: data.level,
        levelTitle: data.levelTitle,
        silver: data.silver,
        hp: data.hp,
        mp: data.mp,
        energy: data.energy,
        attrs: data.attrs,
        equipBonus: data.equipBonus,
        combat: data.combat,
        exp: data.exp,
        expToNextLevel: data.expToNextLevel,
        potential: data.potential,
        score: data.score,
        freePoints: data.freePoints,
      });
    };

    const handleEquipmentUpdate = (data: any) => {
      useGameStore.getState().setEquipment(data.equipment ?? {});
    };

    /** 战斗开始 → 写入 store + 跳转战斗页 */
    const handleCombatStart = (data: any) => {
      useGameStore.getState().setCombatStart(data);
      if (navigationRef.isReady()) {
        (navigationRef as any).navigate('Combat');
      }
    };

    /** 战斗更新 → 更新双方状态 + 追加日志 */
    const handleCombatUpdate = (data: any) => {
      useGameStore.getState().setCombatUpdate(data);
    };

    /** 战斗结束 → 写入结算 + 写入首页日志 + 延迟返回 GameHome */
    const handleCombatEnd = (data: any) => {
      useGameStore.getState().setCombatEnd(data);
      // 战斗结果写入首页日志
      if (data.message) {
        const colorMap: Record<string, string> = {
          victory: '#4A6B4A',
          defeat: '#8B3A3A',
          flee: '#8B7A5A',
        };
        useGameStore.getState().appendLog({
          text: data.message,
          color: colorMap[data.reason] || '#3D3935',
        });
      }
      setTimeout(() => {
        if (navigationRef.isReady()) {
          (navigationRef as any).navigate('GameHome');
        }
        useGameStore.getState().clearCombat();
      }, 2000);
    };

    /** 任务更新 → 刷新任务列表 + 同步经验/等级等字段 */
    const handleQuestUpdate = (data: any) => {
      const { setQuests, updatePlayer } = useGameStore.getState();
      setQuests({ active: data.active, completed: data.completed });
      updatePlayer({
        exp: data.exp,
        level: data.level,
        potential: data.potential,
        score: data.score,
        freePoints: data.freePoints,
      });
    };

    wsService.on('roomInfo', handleRoomInfo);
    wsService.on('commandResult', handleCommandResult);
    wsService.on('message', handleMessage);
    wsService.on('playerStats', handlePlayerStats);
    wsService.on('inventoryUpdate', handleInventoryUpdate);
    wsService.on('equipmentUpdate', handleEquipmentUpdate);
    wsService.on('combatStart', handleCombatStart);
    wsService.on('combatUpdate', handleCombatUpdate);
    wsService.on('combatEnd', handleCombatEnd);
    wsService.on('questUpdate', handleQuestUpdate);

    return () => {
      wsService.off('roomInfo', handleRoomInfo);
      wsService.off('commandResult', handleCommandResult);
      wsService.off('message', handleMessage);
      wsService.off('playerStats', handlePlayerStats);
      wsService.off('inventoryUpdate', handleInventoryUpdate);
      wsService.off('equipmentUpdate', handleEquipmentUpdate);
      wsService.off('combatStart', handleCombatStart);
      wsService.off('combatUpdate', handleCombatUpdate);
      wsService.off('combatEnd', handleCombatEnd);
      wsService.off('questUpdate', handleQuestUpdate);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <UIProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="CreateCharacter"
              component={CreateCharacterScreen}
            />
            <Stack.Screen name="OriginSelect" component={OriginSelectScreen} />
            <Stack.Screen name="FateReveal" component={FateRevealScreen} />
            <Stack.Screen
              name="AttributeAllocate"
              component={AttributeAllocateScreen}
            />
            <Stack.Screen
              name="CharacterConfirm"
              component={CharacterConfirmScreen}
            />
            <Stack.Screen name="GameHome" component={GameHomeScreen} />
            <Stack.Screen
              name="Combat"
              component={CombatScreen}
              options={{ gestureEnabled: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UIProvider>
    </SafeAreaProvider>
  );
}

export default App;
