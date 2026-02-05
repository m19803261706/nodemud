/**
 * 应用根组件
 * 配置路由导航和 WebSocket 连接
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

const WS_URL = 'ws://localhost:4000';
const Stack = createNativeStackNavigator();

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
      // 有消息 → 写入日志（失败红色，成功默认色）
      if (data.message) {
        const { appendLog } = useGameStore.getState();
        const color = data.success ? '#3D3935' : '#8B3A3A';
        appendLog({ text: data.message, color });
      }
    };

    const handlePlayerStats = (data: any) => {
      const { updatePlayer } = useGameStore.getState();
      updatePlayer(data);
    };

    wsService.on('roomInfo', handleRoomInfo);
    wsService.on('commandResult', handleCommandResult);
    wsService.on('playerStats', handlePlayerStats);
    wsService.on('inventoryUpdate', handleInventoryUpdate);

    return () => {
      wsService.off('roomInfo', handleRoomInfo);
      wsService.off('commandResult', handleCommandResult);
      wsService.off('playerStats', handlePlayerStats);
      wsService.off('inventoryUpdate', handleInventoryUpdate);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <UIProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
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
          </Stack.Navigator>
        </NavigationContainer>
      </UIProvider>
    </SafeAreaProvider>
  );
}

export default App;
