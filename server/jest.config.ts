/**
 * Jest 配置文件
 * 使用 ts-jest 支持 TypeScript 测试
 */
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!**/*.d.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
