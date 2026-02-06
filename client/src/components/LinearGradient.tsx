/**
 * LinearGradient — Fabric 兼容的渐变组件
 * 使用 RN 0.76+ 内置 experimental_backgroundImage 替代不兼容 Fabric 的 react-native-linear-gradient
 * API 与 react-native-linear-gradient 完全一致，可直接替换 import
 */

import React from 'react';
import {
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface LinearGradientProps extends ViewProps {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: readonly number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/** 将 react-native-linear-gradient 的 props 转为 CSS linear-gradient 字符串 */
function toGradientCSS(
  colors: readonly string[],
  start: { x: number; y: number },
  end: { x: number; y: number },
  locations?: readonly number[],
): string {
  /* 由 start/end 向量推算 CSS 角度
   * CSS 角度: 0deg=向上, 90deg=向右, 180deg=向下
   * RN 坐标: x 0→1 左→右, y 0→1 上→下 */
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.round(Math.atan2(dx, -dy) * (180 / Math.PI));

  const stops = colors
    .map((color, i) => {
      if (locations?.[i] !== undefined) {
        return `${color} ${Math.round(locations[i] * 100)}%`;
      }
      return color;
    })
    .join(', ');

  return `linear-gradient(${angle}deg, ${stops})`;
}

const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0.5, y: 0 },
  end = { x: 0.5, y: 1 },
  locations,
  style,
  children,
  ...rest
}) => {
  const gradient = toGradientCSS(colors, start, end, locations);

  return (
    <View {...rest} style={[style, { experimental_backgroundImage: gradient }]}>
      {children}
    </View>
  );
};

export default LinearGradient;
