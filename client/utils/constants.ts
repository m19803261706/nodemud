/**
 * 应用全局常量
 * API 地址、WebSocket 地址、版本号等
 */

/** Android 统一用 localhost，通过 adb reverse 转发到宿主机（兼容模拟器和真机） */
export const API_BASE_URL = 'http://localhost:4000';
export const WS_URL = 'ws://localhost:4000';
export const APP_VERSION = '0.1.0';
