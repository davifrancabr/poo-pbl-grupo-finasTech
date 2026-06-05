import { ClearingService } from '@/domain/clearing/ClearingService';
import type { Settlement } from '@/domain/clearing/Settlement';
import type { GetGroupBalances } from './GetGroupBalancesPlan';

export class GetClearingPlan {
  private readonly clearing = new ClearingService();

  constructor(private readonly getBalances: GetGroupBalances) {}

  async execute(groupId: string): Promise<Settlement[]> {
    const balances = await this.getBalances.execute(groupId);

    return this.clearing.simplify(balances);
  }
}
