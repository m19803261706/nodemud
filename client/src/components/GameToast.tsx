/**
 * GameToast 通知组件 - 水墨风
 * 支持成功/失败/警告/信息四种类型，匹配 Pencil 设计稿
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

/** Toast 类型 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast 组件属性 */
export interface GameToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

/** 类型对应的颜色和图标配置 */
const TYPE_CONFIG: Record<
  ToastType,
  {
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    icon: string;
    borderColors: [string, string, string];
  }
> = {
  success: {
    iconBg: '#2F5D3A20',
    iconBorder: '#2F5D3A60',
    iconColor: '#2F5D3A',
    icon: 'check',
    borderColors: ['#2F5D3A40', '#2F5D3A80', '#2F5D3A40'],
  },
  error: {
    iconBg: '#8B3A3A20',
    iconBorder: '#8B3A3A60',
    iconColor: '#8B3A3A',
    icon: 'x',
    borderColors: ['#8B3A3A40', '#8B3A3A80', '#8B3A3A40'],
  },
  warning: {
    iconBg: '#7A6B2F20',
    iconBorder: '#7A6B2F60',
    iconColor: '#7A6B2F',
    icon: 'alert-triangle',
    borderColors: ['#7A6B2F40', '#7A6B2F80', '#7A6B2F40'],
  },
  info: {
    iconBg: '#8B7A5A20',
    iconBorder: '#8B7A5A60',
    iconColor: '#8B7A5A',
    icon: 'info',
    borderColors: ['#8B7A5A20', '#8B7A5A60', '#8B7A5A20'],
  },
};

export const GameToast: React.FC<GameToastProps> = ({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose?.());
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.wrapper, { transform: [{ translateY }], opacity }]}
          >
            {/* 用 View 做布局容器，LinearGradient 只做背景 */}
            <View style={styles.card}>
              {/* 渐变背景 */}
              <LinearGradient
                colors={['#F5F0E8', '#EBE5DA']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />

              {/* 顶部渐变色条 */}
              <View style={styles.borderTop}>
                <LinearGradient
                  colors={config.borderColors}
                  style={{ height: 2, width: '100%' }}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                />
              </View>

              {/* 内容行 */}
              <View style={styles.content}>
                {/* 图标 */}
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: config.iconBg,
                      borderColor: config.iconBorder,
                    },
                  ]}
                >
                  <Feather
                    name={config.icon}
                    size={14}
                    color={config.iconColor}
                  />
                </View>

                {/* 文字 */}
                <View style={styles.textArea}>
                  <Text style={styles.title}>{title}</Text>
                  {message ? (
                    <Text style={styles.message}>{message}</Text>
                  ) : null}
                </View>

                {/* 关闭按钮 */}
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Feather name="x" size={16} color="#8B7A5A60" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  wrapper: {
    width: '85%',
    maxWidth: 340,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B7A5A30',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  borderTop: {
    height: 2,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
    fontFamily: 'Noto Serif SC',
  },
  message: {
    fontSize: 12,
    color: '#6B5D4D',
    fontFamily: 'Noto Serif SC',
    lineHeight: 18,
    marginTop: 2,
  },
});
