/**
 * UIProvider - 全局 UI 上下文
 * 提供 showAlert 和 showToast 方法，管理弹窗/通知队列
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Keyboard } from 'react-native';
import { GameAlert, GameAlertProps, AlertButton } from './GameAlert';
import { GameToast, GameToastProps, ToastType } from './GameToast';
import { wsService } from '../services/WebSocketService';

/** Alert 配置 */
interface AlertConfig {
  type: 'success' | 'error';
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

/** Toast 配置 */
interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/** UI 上下文接口 */
interface UIContextValue {
  showAlert: (config: AlertConfig) => void;
  showToast: (config: ToastConfig) => void;
  hideAlert: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

/** 获取 UI 上下文 Hook */
export const useUI = (): UIContextValue => {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI 必须在 UIProvider 内部使用');
  }
  return ctx;
};

/** UIProvider 组件 */
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Alert 状态
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    type: 'success',
    title: '',
  });

  // Toast 状态
  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    type: 'info',
    title: '',
  });
  const toastKey = useRef(0);

  /** 显示 Alert 弹窗 */
  const showAlert = useCallback((config: AlertConfig) => {
    // 收起键盘，避免输入框层级覆盖弹窗
    Keyboard.dismiss();
    // 包装按钮 onPress，自动关闭弹窗
    const wrappedButtons = (config.buttons || [{ text: '确定' }]).map(btn => ({
      ...btn,
      onPress: () => {
        setAlertVisible(false);
        btn.onPress?.();
      },
    }));
    setAlertConfig({ ...config, buttons: wrappedButtons });
    setAlertVisible(true);
  }, []);

  /** 隐藏 Alert */
  const hideAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  /** 显示 Toast 通知 */
  const showToast = useCallback((config: ToastConfig) => {
    Keyboard.dismiss();
    // 先关闭当前 Toast，再显示新的
    setToastVisible(false);
    setTimeout(() => {
      toastKey.current += 1;
      setToastConfig(config);
      setToastVisible(true);
    }, 50);
  }, []);

  /** Toast 关闭回调 */
  const handleToastClose = useCallback(() => {
    setToastVisible(false);
  }, []);

  /** 监听服务端推送的 toast / alert 消息 */
  useEffect(() => {
    const handleServerToast = (data: any) => {
      // 服务端 level 映射到前端 ToastType
      const typeMap: Record<string, ToastType> = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
      };
      showToast({
        type: typeMap[data.level] || 'info',
        title:
          data.level === 'error'
            ? '错误'
            : data.level === 'warning'
              ? '注意'
              : '提示',
        message: data.message,
        duration: data.duration,
      });
    };

    const handleServerAlert = (data: any) => {
      const alertType = data.level === 'error' ? 'error' : 'success';
      showAlert({
        type: alertType,
        title: data.title,
        message: data.message,
        buttons: [{ text: '确定' }],
      });
    };

    wsService.on('toast', handleServerToast);
    wsService.on('alert', handleServerAlert);

    return () => {
      wsService.off('toast', handleServerToast);
      wsService.off('alert', handleServerAlert);
    };
  }, [showToast, showAlert]);

  return (
    <UIContext.Provider value={{ showAlert, showToast, hideAlert }}>
      {children}

      {/* 全局 Alert */}
      <GameAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />

      {/* 全局 Toast */}
      <GameToast
        key={toastKey.current}
        visible={toastVisible}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        duration={toastConfig.duration}
        onClose={handleToastClose}
      />
    </UIContext.Provider>
  );
};
