/**
 * 门派策略注册表
 */
import { Injectable, Logger } from '@nestjs/common';
import type { SectPolicy } from './policies/sect-policy';

@Injectable()
export class SectRegistry {
  private readonly logger = new Logger(SectRegistry.name);
  private readonly policies: Map<string, SectPolicy> = new Map();

  register(policy: SectPolicy): void {
    if (this.policies.has(policy.sectId)) {
      this.logger.warn(`门派策略 ${policy.sectId} 已存在，将覆盖旧策略`);
    }
    this.policies.set(policy.sectId, policy);
  }

  get(sectId: string): SectPolicy | undefined {
    return this.policies.get(sectId);
  }

  getAll(): SectPolicy[] {
    return [...this.policies.values()];
  }
}
