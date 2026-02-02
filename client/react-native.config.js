const path = require('path');

module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null, // 手动管理 iOS 字体
      },
    },
    // pnpm monorepo: 包被 hoist 到根 node_modules，需要显式指定路径
    '@react-native-async-storage/async-storage': {
      root: path.resolve(
        __dirname,
        '..',
        'node_modules',
        '@react-native-async-storage',
        'async-storage',
      ),
    },
  },
};
