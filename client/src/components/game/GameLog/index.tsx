/**
 * 游戏日志 — 日志列表 + 动作按钮栏
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { ActionButton } from './ActionButton';
import { MapDescription } from './MapDescription';
import { LogScrollView } from '../shared/LogScrollView';

export const GameLog = () => {
  const showMapDesc = useGameStore(state => state.showMapDesc);
  const description = useGameStore(state => state.location.description);
  const logQuickActions = useGameStore(state => state.logQuickActions);
  const sendCommand = useGameStore(state => state.sendCommand);
  const removeLogQuickAction = useGameStore(
    state => state.removeLogQuickAction,
  );

  return (
    <View style={s.container}>
      {showMapDesc && <MapDescription text={description} />}
      <LogScrollView style={s.logArea} contentPaddingBottom={38} />
      {logQuickActions.length > 0 ? (
        <View style={s.actionBar}>
          {logQuickActions.map(action => (
            <ActionButton
              key={action.id}
              label={action.label}
              onPress={() => {
                sendCommand(action.command);
                if (action.consumeOnPress !== false) {
                  removeLogQuickAction(action.id);
                }
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    padding: 12,
  },
  logArea: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
});
