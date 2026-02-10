module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|@react-navigation|react-native-vector-icons)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
