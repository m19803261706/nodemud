/**
 * 环境变量验证配置
 * 使用 class-validator 验证必需的环境变量
 */

import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * 环境枚举
 */
enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * 环境变量验证类
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;
}

/**
 * 验证环境变量
 * @param config - 原始环境变量对象
 * @returns 验证后的环境变量对象
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`环境变量验证失败:\n${errors.toString()}`);
  }

  return validatedConfig;
}
