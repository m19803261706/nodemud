/**
 * 地点名称 — fontSize 22, letterSpacing 8
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface LocationTitleProps {
  name: string;
}

export const LocationTitle = ({ name }: LocationTitleProps) => (
  <Text style={s.title}>{name}</Text>
);

const s = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 8,
  },
});
