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
            <Stack.Screen
              name="OriginSelect"
              component={OriginSelectScreen}
            />
            <Stack.Screen
              name="FateReveal"
              component={FateRevealScreen}
            />
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
