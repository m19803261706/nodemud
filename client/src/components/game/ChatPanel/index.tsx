/**
 * 聊天面板 — 聊天消息列表 + 聊天按钮
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { ChatMessage } from './ChatMessage';
import { ChatInputButton } from './ChatInputButton';

export const ChatPanel = () => {
  const chatMessages = useGameStore(state => state.chatMessages);

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {chatMessages.map((msg, i) => (
          <ChatMessage key={i} text={msg.text} color={msg.color} />
        ))}
      </ScrollView>
      <View style={s.bottom}>
        <ChatInputButton />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: '#F5F0E830',
    borderWidth: 1,
    borderColor: '#8B7A5A30',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#8B7A5A20',
  },
});
