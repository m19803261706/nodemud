/**
 * SectActions -- 门派操作按钮区
 * 提供传送到师父/执事/演武场的快捷按钮
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SectNpcLocations, SectTeleportRole } from '@packages/core';

interface SectActionsProps {
  npcLocations: SectNpcLocations | null;
  onTeleport: (role: SectTeleportRole) => void;
}

/** 按钮配置 */
const ACTION_BUTTONS: {
  role: SectTeleportRole;
  label: string;
}[] = [
  { role: 'master', label: '找师父' },
  { role: 'deacon', label: '找执事' },
  { role: 'sparring', label: '去演武场' },
];

export const SectActions = ({ npcLocations, onTeleport }: SectActionsProps) => {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>快捷操作</Text>
      <View style={s.buttonRow}>
        {ACTION_BUTTONS.map(({ role, label }) => {
          const loc = npcLocations?.[role];
          const available = !!loc;

          return (
            <TouchableOpacity
              key={role}
              style={[s.btn, !available ? s.btnDisabled : undefined]}
              onPress={() => {
                if (available) onTeleport(role);
              }}
              activeOpacity={available ? 0.7 : 1}
              disabled={!available}
            >
              <Text
                style={[
                  s.btnLabel,
                  !available ? s.btnLabelDisabled : undefined,
                ]}
              >
                {label}
              </Text>
              {loc ? (
                <Text style={s.btnHint} numberOfLines={1}>
                  {loc.npcName}
                </Text>
              ) : (
                <Text style={s.btnHintMissing}>不在</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  btn: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  btnLabelDisabled: {
    color: '#A09888',
  },
  btnHint: {
    fontSize: 10,
    color: '#8B7A5A',
    fontFamily: 'Noto Serif SC',
  },
  btnHintMissing: {
    fontSize: 10,
    color: '#A09888',
    fontFamily: 'Noto Serif SC',
  },
});
