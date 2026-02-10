# Android 开发调试指南（模拟器 + 真机）

本文档介绍如何安装和配置 Android 开发环境，在模拟器和真机上调试 RenZai Game 客户端。

---

## 一、环境准备

### 必需软件

| 软件           | 版本要求       | 说明                            |
| -------------- | -------------- | ------------------------------- |
| Android Studio | 最新稳定版     | 包含 SDK Manager 和 AVD Manager |
| JDK            | **17**（推荐） | JDK 24 会导致 CMake 构建失败    |
| Node.js        | >= 18          | React Native 运行环境           |
| pnpm           | >= 8           | 包管理器                        |

> **重要**: JDK 版本必须为 17，JDK 24 与 React Native 的 CMake 配置不兼容，会报 `A restricted method in java.lang.System has been called` 错误。

---

## 二、安装 Android Studio 与 SDK

### macOS

1. 下载 Android Studio: https://developer.android.com/studio
2. 打开 `.dmg` 文件，将 Android Studio 拖入 Applications
3. 首次启动，按向导完成 SDK 安装（默认安装路径 `~/Library/Android/sdk`）
4. 在 SDK Manager 中确保安装以下组件:
   - **SDK Platforms**: Android 14 (API 34) 或更新
   - **SDK Tools**:
     - Android SDK Build-Tools
     - Android SDK Command-line Tools
     - Android Emulator
     - Android SDK Platform-Tools
     - CMake
     - NDK (Side by side)

5. 配置环境变量（编辑 `~/.zshrc` 或 `~/.bash_profile`）:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

执行 `source ~/.zshrc` 使配置生效。

### Windows

1. 下载 Android Studio: https://developer.android.com/studio
2. 运行安装程序，按向导完成安装（默认路径 `C:\Users\<用户名>\AppData\Local\Android\Sdk`）
3. 首次启动，按向导完成 SDK 安装
4. 在 SDK Manager 中安装与 macOS 相同的组件
5. 配置环境变量（系统设置 → 高级系统设置 → 环境变量）:

| 变量名         | 值                                                |
| -------------- | ------------------------------------------------- |
| `JAVA_HOME`    | `C:\Program Files\Java\jdk-17`（JDK 17 安装路径） |
| `ANDROID_HOME` | `C:\Users\<用户名>\AppData\Local\Android\Sdk`     |

在 `Path` 中添加:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\cmdline-tools\latest\bin
```

> Windows 上也可以通过 Android Studio 内置的 JDK（Settings → Build → Gradle → Gradle JDK）指定 JDK 17。

---

## 三、创建模拟器 (AVD)

### 通过 Android Studio GUI

1. 打开 Android Studio
2. 菜单: **Tools → Device Manager**（或欢迎页右侧 **More Actions → Virtual Device Manager**）
3. 点击 **Create Virtual Device**
4. 选择设备模板（推荐 **Medium Phone**）→ Next
5. 选择系统镜像（推荐 **API 34** 或更新，选择带 Google APIs 的 arm64 版本）→ Next
6. 设置 AVD 名称 → Finish

### 通过命令行

```bash
# 查看可用系统镜像
sdkmanager --list | grep system-images

# 下载系统镜像（示例: API 34 arm64）
sdkmanager "system-images;android-34;google_apis;arm64-v8a"

# 创建 AVD
avdmanager create avd -n MyDevice -k "system-images;android-34;google_apis;arm64-v8a" -d pixel

# 验证
emulator -list-avds
```

---

## 四、启动模拟器

### macOS

```bash
# 查看可用的模拟器
$HOME/Library/Android/sdk/emulator/emulator -list-avds

# 启动（替换为你的 AVD 名称）
$HOME/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.0 &
```

如果已配置环境变量:

```bash
emulator -list-avds
emulator -avd Medium_Phone_API_36.0 &
```

### Windows

```powershell
# 查看可用的模拟器
%ANDROID_HOME%\emulator\emulator -list-avds

# 启动
%ANDROID_HOME%\emulator\emulator -avd Medium_Phone_API_36.0
```

或在 PowerShell 中:

```powershell
& "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Medium_Phone_API_36.0
```

### 验证模拟器已就绪

```bash
adb devices
```

输出应显示:

```
List of devices attached
emulator-5554   device
```

状态为 `device` 表示已就绪。如果显示 `offline`，等待几秒后重试。

---

## 五、网络配置（adb reverse 端口转发）

本项目代码中统一使用 `localhost` 作为服务地址。Android 设备（无论模拟器还是真机）的 `localhost` 指向设备自身，需要通过 `adb reverse` 将端口转发到开发电脑。

**每次连接设备后执行一次:**

```bash
# Metro bundler（JS 代码加载）
adb reverse tcp:8081 tcp:8081

# WebSocket 服务（游戏后端）
adb reverse tcp:4000 tcp:4000
```

如果同时连接了多个设备，需要用 `-s` 指定设备:

```bash
# 查看已连接的设备
adb devices

# 为指定设备设置端口转发
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 reverse tcp:4000 tcp:4000

adb -s <真机序列号> reverse tcp:8081 tcp:8081
adb -s <真机序列号> reverse tcp:4000 tcp:4000
```

> **为什么不用 `10.0.2.2`?**
> `10.0.2.2` 是 Android 模拟器专属的虚拟地址，只在模拟器中有效，真机上无法解析。使用 `adb reverse` + `localhost` 是通用方案，模拟器和真机均适用。

---

## 六、在模拟器上运行应用

确保模拟器已启动、`adb reverse` 已设置:

```bash
# 设置端口转发
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 reverse tcp:4000 tcp:4000

# 构建并安装应用
pnpm client:android
```

首次构建较慢（编译 native 代码），后续构建使用缓存。

---

## 七、在真机上运行应用

### 7.1 前置准备

#### 开启开发者选项和 USB 调试

1. 打开手机 **设置 → 关于手机**
2. 连续点击 **版本号** 7 次，提示"已进入开发者模式"
3. 返回设置，进入 **开发者选项**（部分手机在 **设置 → 系统 → 开发者选项**）
4. 开启 **USB 调试**
5. 部分手机（如小米、OPPO）还需开启 **USB 安装** 和 **USB 调试（安全设置）**

#### 使用 USB 数据线连接电脑

1. 使用数据线连接手机和电脑（确保是数据线，非充电线）
2. 手机上弹出"是否允许 USB 调试"，选择 **允许**（建议勾选"始终允许"）
3. 如果手机提示选择 USB 用途，选择 **文件传输 / MTP** 模式

#### 验证连接

```bash
adb devices
```

输出应类似:

```
List of devices attached
IZUK6D7HIVJZMRC6    device
```

状态为 `device` 表示连接正常。如果显示 `unauthorized`，请在手机上确认 USB 调试授权弹窗。

### 7.2 设置端口转发

```bash
# 替换 <设备序列号> 为 adb devices 中显示的序列号
adb -s <设备序列号> reverse tcp:8081 tcp:8081
adb -s <设备序列号> reverse tcp:4000 tcp:4000
```

### 7.3 构建并安装到真机

```bash
# 指定设备运行
npx react-native run-android --device <设备序列号>

# 或者在项目根目录（如果只连接了一台真机）
pnpm client:android
```

> 如果同时连接了模拟器和真机，`pnpm client:android` 会安装到所有设备。使用 `--device` 参数可以指定目标设备。

### 7.4 验证应用运行

应用安装后会自动启动。检查:

1. **页面是否正常加载** — 能看到登录界面说明 Metro bundler 连接正常
2. **WebSocket 是否连接** — 能登录说明后端通信正常
3. **热重载是否工作** — 修改代码后手机自动刷新

### 7.5 Windows 真机调试

Windows 上步骤相同，需要额外注意:

1. **安装 USB 驱动**: 部分手机需要安装品牌官方 USB 驱动（如小米助手、华为 HiSuite）
2. **驱动问题排查**: 如果 `adb devices` 无输出，在设备管理器中检查是否有未识别设备
3. 端口转发和构建命令与 macOS 一致

---

## 八、常见问题

### Q: 构建报错 `A restricted method in java.lang.System has been called`

**原因**: JDK 版本过高（24），React Native CMake 不兼容。

**解决**: 切换到 JDK 17。

```bash
# macOS — 查看已安装的 JDK
/usr/libexec/java_home -V

# 临时切换
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# 验证
java -version
```

Windows 在环境变量中将 `JAVA_HOME` 指向 JDK 17 安装路径。

### Q: 构建报错 `SDK location not found`

**解决**: 在 `client/android/local.properties` 中指定 SDK 路径:

```properties
# macOS
sdk.dir=/Users/<用户名>/Library/Android/sdk

# Windows
sdk.dir=C:\\Users\\<用户名>\\AppData\\Local\\Android\\Sdk
```

### Q: 应用无法连接 WebSocket 服务

**检查清单**:

1. 后端服务是否已启动（`pnpm server:dev`，端口 4000）
2. `adb devices` 是否显示设备状态为 `device`
3. `adb reverse` 是否已设置:

```bash
# 检查当前端口转发
adb reverse --list

# 重新设置
adb reverse tcp:4000 tcp:4000
adb reverse tcp:8081 tcp:8081
```

4. 如果断开重连过 USB，需要重新执行 `adb reverse`

### Q: 真机上 `adb devices` 显示 `unauthorized`

手机上没有确认 USB 调试授权。解决:

1. 拔掉 USB 重新插入
2. 手机上会弹出授权弹窗，点击 **允许**
3. 如果没有弹窗，尝试: 开发者选项 → 撤销 USB 调试授权 → 重新插入 USB

### Q: 真机上 `adb devices` 无输出

**Windows**: 检查 USB 驱动是否安装，在设备管理器中查看是否有未识别设备。安装对应品牌的手机助手通常会自动安装驱动。

**macOS**: 通常免驱动。尝试换一根数据线（部分线只支持充电不支持数据传输）。

### Q: 模拟器启动后黑屏或卡在开机动画

**解决**:

- 确保 CPU 虚拟化已开启（BIOS 中启用 Intel VT-x 或 AMD-V）
- Windows 用户确保 Hyper-V 或 WHPX 已启用
- 尝试 Cold Boot: Device Manager → 模拟器右侧菜单 → Cold Boot Now
- 分配更多 RAM（Device Manager → 编辑 AVD → Show Advanced Settings → RAM）

### Q: `emulator` 命令找不到

确认环境变量配置正确:

```bash
# macOS
which emulator
# 应输出: /Users/<用户名>/Library/Android/sdk/emulator/emulator

# Windows (PowerShell)
Get-Command emulator
```

如果找不到，直接使用完整路径或检查 `PATH` 配置。

### Q: 真机上应用加载白屏 / "Unable to load script"

Metro bundler 未连接。解决:

1. 确认 Metro 正在运行（`pnpm start` 或 `pnpm client:start`）
2. 确认端口转发: `adb reverse tcp:8081 tcp:8081`
3. 摇一摇手机 → Dev Menu → Change Bundle Location → 输入 `localhost:8081`

---

## 九、快速参考

### 模拟器调试流程

```bash
# 1. 启动模拟器
emulator -avd Medium_Phone_API_36.0 &

# 2. 设置端口转发
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 reverse tcp:4000 tcp:4000

# 3. 启动后端
pnpm server:dev

# 4. 构建并运行
pnpm client:android
```

### 真机调试流程

```bash
# 1. USB 连接手机，确认已开启 USB 调试
adb devices

# 2. 设置端口转发
adb -s <设备序列号> reverse tcp:8081 tcp:8081
adb -s <设备序列号> reverse tcp:4000 tcp:4000

# 3. 启动后端
pnpm server:dev

# 4. 构建并运行到真机
npx react-native run-android --device <设备序列号>
```
