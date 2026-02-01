/**
 * Account Service
 * 账号管理业务逻辑：注册、登录
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Account } from './account.entity';

/** 注册结果 */
interface RegisterResult {
  success: boolean;
  accountId?: string;
  reason?: 'username_exists' | 'phone_exists' | 'server_error';
  message: string;
}

/** 登录结果 */
interface LoginResult {
  success: boolean;
  account?: {
    id: string;
    username: string;
  };
  hasCharacter: boolean;
  characterId?: string;
  characterName?: string;
  reason?: 'account_not_found' | 'invalid_password' | 'server_error';
  message: string;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * 注册账号
   * @param username 用户名（6-20字符，包含数字+字母）
   * @param password 密码（6+字符，包含数字+字母）
   * @param phone 手机号（11位）
   */
  async register(username: string, password: string, phone: string): Promise<RegisterResult> {
    try {
      // 校验用户名格式：6-20字符，需含数字和字母
      if (username.length < 6 || username.length > 20) {
        return {
          success: false,
          reason: 'username_exists' as const,
          message: '用户名长度应为 6-20 个字符',
        };
      }
      if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(username)) {
        return {
          success: false,
          reason: 'username_exists' as const,
          message: '用户名必须包含数字和字母',
        };
      }

      // 校验密码格式：至少6字符，需含数字和字母
      if (password.length < 6) {
        return {
          success: false,
          reason: 'server_error' as const,
          message: '密码至少 6 个字符',
        };
      }
      if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
        return {
          success: false,
          reason: 'server_error' as const,
          message: '密码必须包含数字和字母',
        };
      }

      // 校验手机号格式：11位纯数字
      if (!/^\d{11}$/.test(phone)) {
        return {
          success: false,
          reason: 'server_error' as const,
          message: '请输入正确的 11 位手机号',
        };
      }

      // 检查用户名是否存在
      const existingUser = await this.accountRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        return {
          success: false,
          reason: 'username_exists',
          message: '用户名已存在',
        };
      }

      // 检查手机号是否存在
      const existingPhone = await this.accountRepository.findOne({
        where: { phone },
      });
      if (existingPhone) {
        return {
          success: false,
          reason: 'phone_exists',
          message: '手机号已被注册',
        };
      }

      // bcrypt 加密密码（rounds=10）
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建账号（UUID v4）
      const account = this.accountRepository.create({
        id: uuidv4(),
        username,
        password: hashedPassword,
        phone,
      });

      await this.accountRepository.save(account);

      return {
        success: true,
        accountId: account.id,
        message: '注册成功',
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        success: false,
        reason: 'server_error',
        message: '服务器错误，请稍后重试',
      };
    }
  }

  /**
   * 登录验证
   * @param username 用户名
   * @param password 密码
   */
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      // 查询账号
      const account = await this.accountRepository.findOne({
        where: { username },
      });
      if (!account) {
        return {
          success: false,
          hasCharacter: false,
          reason: 'account_not_found',
          message: '账号不存在',
        };
      }

      // bcrypt 验证密码
      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) {
        return {
          success: false,
          hasCharacter: false,
          reason: 'invalid_password',
          message: '密码错误',
        };
      }

      // 更新最后登录时间
      account.lastLoginAt = new Date();
      await this.accountRepository.save(account);

      // TODO: 检查是否有角色（后期实现）
      const hasCharacter = false;

      return {
        success: true,
        account: {
          id: account.id,
          username: account.username,
        },
        hasCharacter,
        characterId: undefined,
        characterName: undefined,
        message: '登录成功',
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        hasCharacter: false,
        reason: 'server_error',
        message: '服务器错误，请稍后重试',
      };
    }
  }
}
