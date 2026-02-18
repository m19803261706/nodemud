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
import { useSkillStore } from './src/stores/useSkillStore';
import { getSkillLearnFailureHint } from './src/utils/skillLearnReason';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { CreateCharacterScreen } from './src/screens/CreateCharacterScreen';
import { OriginSelectScreen } from './src/screens/OriginSelectScreen';
import { FateRevealScreen } from './src/screens/FateRevealScreen';
import { AttributeAllocateScreen } from './src/screens/AttributeAllocateScreen';
import { CharacterConfirmScreen } from './src/screens/CharacterConfirmScreen';
import { GameHomeScreen } from './src/screens/GameHomeScreen';
import CombatScreen from './src/screens/CombatScreen';

/** Android 统一用 localhost，通过 adb reverse 转发到宿主机（兼容模拟器和真机） */
const WS_URL = 'ws://localhost:4000';
const Stack = createNativeStackNavigator();

/** 导航引用（用于 WebSocket 回调中的页面跳转） */
const navigationRef = createNavigationContainerRef();

const SONGYANG_GATE_INTENT_ACTION_ID = 'songyang-gate-intent';
const SONGYANG_GATE_INTENT_COMMAND = 'ask 守山弟子 about 来意';

function stripRichTags(text: string): string {
  return text.replace(/\[[^\]]+\]/g, '');
}

/** 八方向集合 — 属于九宫格导航的标准方向 */
const STANDARD_DIRS = new Set([
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
]);

/** 特殊出口中文标签映射 */
const SPECIAL_EXIT_LABEL: Record<string, string> = {
  up: '上楼',
  down: '下楼',
  enter: '进入',
  out: '出去',
  climb: '攀爬',
};

/** 特殊出口 → logQuickAction ID 前缀 */
const SPECIAL_EXIT_ACTION_PREFIX = 'exit-';

function buildLocationActions(): string[] {
  return ['回城', '飞行', '地图', '邮件'];
}

/** 从 exits 中提取非八方向的特殊出口，生成 logQuickAction 列表 */
function buildSpecialExitActions(
  exits: string[],
  exitNames?: Record<string, string>,
): { id: string; label: string; command: string; consumeOnPress: boolean }[] {
  return exits
    .filter(dir => !STANDARD_DIRS.has(dir))
    .map(dir => {
      // 优先用目标房间名，其次用固定映射，最后用原始方向
      const targetName = exitNames?.[dir];
      const label = targetName
        ? `${SPECIAL_EXIT_LABEL[dir] || dir}·${targetName}`
        : SPECIAL_EXIT_LABEL[dir] || dir;
      return {
        id: `${SPECIAL_EXIT_ACTION_PREFIX}${dir}`,
        label,
        command: `go ${dir}`,
        consumeOnPress: false,
      };
    });
}

/** 应用根组件 */
function App(): React.JSX.Element {
  // App 启动时建立 WebSocket 连接（类似 MUD 的 telnet 连接大厅）
  // 不在 cleanup 中断开，连接跟随进程生命周期而非组件生命周期
  useEffect(() => {
    if (!wsService.isConnected) {
      wsService.connect(WS_URL);
    }

    const syncSongyangGateIntentAction = (rawText: unknown) => {
      const content = typeof rawText === 'string' ? rawText : '';
      if (!content) return;

      const plain = stripRichTags(content);
      const { location, upsertLogQuickAction, removeLogQuickAction } =
        useGameStore.getState();

      if (location.name !== '嵩阳山道') {
        return;
      }

      if (
        plain.includes('守山弟子') &&
        (plain.includes('报上来意') || plain.includes('先把来意说明白'))
      ) {
        upsertLogQuickAction({
          id: SONGYANG_GATE_INTENT_ACTION_ID,
          label: '说明来意',
          command: SONGYANG_GATE_INTENT_COMMAND,
          consumeOnPress: true,
        });
        return;
      }

      if (
        plain.includes('可入山门一次') ||
        plain.includes('同门请入') ||
        plain.includes('侧身让出半步')
      ) {
        removeLogQuickAction(SONGYANG_GATE_INTENT_ACTION_ID);
      }
    };

    // 全局监听游戏消息（必须在连接建立时就注册，避免导航时丢消息）
    const handleRoomInfo = (data: any) => {
      const {
        setLocation,
        setDirections,
        setNpcs,
        setGroundItems,
        removeLogQuickAction,
        upsertLogQuickAction,
        setWorkListDetail,
      } = useGameStore.getState();
      // 截取地点名（去掉区域前缀，如"裂隙镇·镇中广场" → "镇中广场"）
      const shortName = data.short?.includes('·')
        ? data.short.split('·').pop()!
        : data.short;
      setLocation({
        name: shortName,
        actions: buildLocationActions(),
        description: data.long,
      });
      setDirections(exitsToDirections(data.exits, shortName, data.exitNames));
      setNpcs(data.npcs ?? []);
      setGroundItems(data.items ?? []);
      useGameStore.getState().setShopListDetail(null);
      setWorkListDetail(null);

      // 清除上一个房间的特殊出口按钮，添加当前房间的
      const { logQuickActions } = useGameStore.getState();
      logQuickActions
        .filter(a => a.id.startsWith(SPECIAL_EXIT_ACTION_PREFIX))
        .forEach(a => removeLogQuickAction(a.id));

      const specialExits = buildSpecialExitActions(
        data.exits ?? [],
        data.exitNames,
      );
      specialExits.forEach(action => upsertLogQuickAction(action));

      if (shortName !== '嵩阳山道') {
        removeLogQuickAction(SONGYANG_GATE_INTENT_ACTION_ID);
      }
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
      // list 货单结果 → 货单弹窗
      if (data.success && data.data?.action === 'list_goods') {
        const payload = data.data;
        if (
          payload.merchantId &&
          payload.merchantName &&
          Array.isArray(payload.goods)
        ) {
          useGameStore.getState().setShopListDetail({
            merchantId: payload.merchantId,
            merchantName: payload.merchantName,
            goods: payload.goods,
          });
        }
        // 货单已由弹窗展示，不再写入日志
        return;
      }
      // 打工工单结果 → 工单弹窗
      if (data.success && data.data?.action === 'work_list') {
        const payload = data.data;
        if (
          payload.npcId &&
          payload.npcName &&
          Array.isArray(payload.jobs) &&
          payload.dailyProgress
        ) {
          useGameStore.getState().setWorkListDetail({
            npcId: payload.npcId,
            npcName: payload.npcName,
            jobs: payload.jobs,
            dailyProgress: payload.dailyProgress,
            active: payload.active,
          });
        }
        // 工单由弹窗承载，不写日志
        return;
      }
      // buy 成功结果 → 同步更新当前货单库存
      if (data.success && data.data?.action === 'buy') {
        useGameStore.getState().applyShopBuyResult(data.data);
      }
      // 有消息 → 写入日志（失败红色，成功默认色）
      if (data.message) {
        const { appendLog } = useGameStore.getState();
        const color = data.success ? '#3D3935' : '#8B3A3A';
        appendLog({ text: data.message, color });
        syncSongyangGateIntentAction(data.message);
      }
      if (
        data.success === false &&
        data.data?.action === 'learn' &&
        typeof data.data?.reason === 'string'
      ) {
        const hint = getSkillLearnFailureHint(data.data.reason);
        if (hint) {
          useGameStore.getState().appendLog({
            text: `学艺提示：${hint}`,
            color: '#8B6A50',
          });
        }
      }
    };

    const handleMessage = (data: any) => {
      const content =
        typeof data === 'string' ? data : data?.content || data?.message;
      if (!content) return;
      useGameStore.getState().appendLog({ text: content, color: '#5A5048' });
      syncSongyangGateIntentAction(content);
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
        ...(typeof data.gender === 'string' ? { gender: data.gender } : {}),
        ...(typeof data.origin === 'string' ? { origin: data.origin } : {}),
        ...(data.sect !== undefined ? { sect: data.sect } : {}),
      } as any);
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

    // ─── 技能系统消息处理 ───

    /** 技能列表全量推送 → 写入 skillStore */
    const handleSkillList = (data: any) => {
      useSkillStore.getState().setSkillList(data);
    };

    /** 单技能增量更新 → 更新 skillStore */
    const handleSkillUpdate = (data: any) => {
      useSkillStore.getState().updateSkill(data);
    };

    /** 学会新技能 → 添加到 skillStore + 写入日志提示 */
    const handleSkillLearn = (data: any) => {
      useSkillStore.getState().addSkill(data);
      if (data.message) {
        useGameStore
          .getState()
          .appendLog({ text: data.message, color: '#4A6B4A' });
      }
    };

    /** 战斗等待行动 → 设置 combat 选招状态 */
    const handleCombatAwaitAction = (data: any) => {
      useGameStore.getState().setCombatAwaitAction(data);
    };

    /** 技能装配结果 → 更新映射 + 写入日志 */
    const handleSkillMapResult = (data: any) => {
      useSkillStore.getState().setSkillMap(data);
      if (data.message) {
        const color = data.success ? '#4A6B4A' : '#8B3A3A';
        useGameStore.getState().appendLog({ text: data.message, color });
      }
    };

    /** 技能面板完整数据 → 写入 skillStore */
    const handleSkillPanelData = (data: any) => {
      useSkillStore.getState().setSkillPanelData(data);
    };

    /** 修炼进度更新 → 更新 skillStore + 写入日志 */
    const handlePracticeUpdate = (data: any) => {
      useSkillStore.getState().updatePractice(data);
      if (data.message) {
        const color = data.levelUp ? '#4A6B4A' : '#5A5048';
        useGameStore.getState().appendLog({ text: data.message, color });
      }
    };

    /** NPC 学艺结果 → 更新 skillStore + 写入日志 */
    const handleSkillLearnResult = (data: any) => {
      useSkillStore.getState().applyLearnResult(data);
      if (data.message) {
        const color = data.success ? '#4A6B4A' : '#8B3A3A';
        useGameStore.getState().appendLog({ text: data.message, color });
      }
      if (!data.success && typeof data.reason === 'string') {
        const hint = getSkillLearnFailureHint(data.reason);
        if (hint) {
          useGameStore.getState().appendLog({
            text: `学艺提示：${hint}`,
            color: '#8B6A50',
          });
        }
      }
    };

    /** 运功结果 → 写入日志 */
    const handleExertResult = (data: any) => {
      if (data.message) {
        const color = data.success ? '#4A6B4A' : '#8B3A3A';
        useGameStore.getState().appendLog({ text: data.message, color });
      }
    };

    /** 房间对象新增 → 增量更新 NPC/地面物品列表 */
    const handleRoomObjectAdded = (data: any) => {
      const { addNpc, addGroundItem } = useGameStore.getState();
      if (data.objectType === 'npc' && data.npc) addNpc(data.npc);
      else if (data.objectType === 'item' && data.item) addGroundItem(data.item);
    };

    /** 房间对象移除 → 增量更新 NPC/地面物品列表 */
    const handleRoomObjectRemoved = (data: any) => {
      const { removeNpc, removeGroundItem } = useGameStore.getState();
      if (data.objectType === 'npc') removeNpc(data.objectId);
      else if (data.objectType === 'item') removeGroundItem(data.objectId);
    };

    /** 地图响应 → 写入 store + 显示弹窗 */
    const handleMapResponse = (data: any) => {
      const { setMapData, setMapVisible } = useGameStore.getState();
      setMapData(data);
      setMapVisible(true);
    };

    /** 导航响应 → 失败时写入日志提示 */
    const handleNavigateResponse = (data: any) => {
      if (!data.success && data.message) {
        useGameStore
          .getState()
          .appendLog({ text: data.message, color: '#8B3A3A' });
      }
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
    wsService.on('skillList', handleSkillList);
    wsService.on('skillUpdate', handleSkillUpdate);
    wsService.on('skillLearn', handleSkillLearn);
    wsService.on('combatAwaitAction', handleCombatAwaitAction);
    wsService.on('skillMapResult', handleSkillMapResult);
    wsService.on('skillPanelData', handleSkillPanelData);
    wsService.on('practiceUpdate', handlePracticeUpdate);
    wsService.on('skillLearnResult', handleSkillLearnResult);
    wsService.on('exertResult', handleExertResult);
    wsService.on('roomObjectAdded', handleRoomObjectAdded);
    wsService.on('roomObjectRemoved', handleRoomObjectRemoved);
    wsService.on('mapResponse', handleMapResponse);
    wsService.on('navigateResponse', handleNavigateResponse);

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
      wsService.off('skillList', handleSkillList);
      wsService.off('skillUpdate', handleSkillUpdate);
      wsService.off('skillLearn', handleSkillLearn);
      wsService.off('combatAwaitAction', handleCombatAwaitAction);
      wsService.off('skillMapResult', handleSkillMapResult);
      wsService.off('skillPanelData', handleSkillPanelData);
      wsService.off('practiceUpdate', handlePracticeUpdate);
      wsService.off('skillLearnResult', handleSkillLearnResult);
      wsService.off('exertResult', handleExertResult);
      wsService.off('roomObjectAdded', handleRoomObjectAdded);
      wsService.off('roomObjectRemoved', handleRoomObjectRemoved);
      wsService.off('mapResponse', handleMapResponse);
      wsService.off('navigateResponse', handleNavigateResponse);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <UIProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            id="root-stack"
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
