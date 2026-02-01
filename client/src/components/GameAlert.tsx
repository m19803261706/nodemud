/**
 * GameAlert 弹窗组件 - 水墨风
 * 支持成功/失败两种类型，匹配 Pencil 设计稿
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

/** 按钮配置 */
export interface AlertButton {
  text: string;
  onPress?: () => void;
}

/** Alert 组件属性 */
export interface GameAlertProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

/** 类型对应的颜色配置 */
const TYPE_COLORS = {
  success: {
    iconBg: '#2F5D3A20',
    iconBorder: '#2F5D3A60',
    iconColor: '#2F5D3A',
    icon: 'check' as const,
  },
  error: {
    iconBg: '#8B3A3A20',
    iconBorder: '#8B3A3A60',
    iconColor: '#8B3A3A',
    icon: 'x' as const,
  },
};

export const GameAlert: React.FC<GameAlertProps> = ({
  visible,
  type,
  title,
  message,
  buttons = [],
  onDismiss,
}) => {
  const colors = TYPE_COLORS[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {/* 弹窗主体 */}
        <LinearGradient
          colors={['#F5F0E8', '#EBE5DA', '#E0D9CC', '#D5CEC0']}
          style={styles.container}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          {/* 渐变描边效果 - 用 border + 内层实现 */}
          <View style={styles.borderOverlay} />

          {/* 图标 */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.iconBg,
                borderColor: colors.iconBorder,
              },
            ]}
          >
            <Feather name={colors.icon} size={24} color={colors.iconColor} />
          </View>

          {/* 标题 */}
          <Text style={styles.title}>{title}</Text>

          {/* 消息 */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* 分割线 */}
          <LinearGradient
            colors={['#8B7A5A00', '#8B7A5A60', '#8B7A5A00']}
            style={styles.divider}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />

          {/* 按钮区域 */}
          <View style={styles.buttonRow}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={styles.buttonWrapper}
                onPress={btn.onPress}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#D5CEC0', '#C9C2B4', '#B8B0A0']}
                  style={styles.button}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Text style={styles.buttonText}>{btn.text}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    borderRadius: 4,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#8B7A5A40',
    borderRadius: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A3530',
    letterSpacing: 4,
    fontFamily: 'Noto Serif SC',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B7A5A80',
    borderRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
    letterSpacing: 2,
  },
});
