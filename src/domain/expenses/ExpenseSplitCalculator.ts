import type { MemberId } from '../group/MemberId';
import type { Money } from '../shared/Money';
import type { SplitAllocation } from './SplitAllocation';
import type { SplitStrategy } from './SplitStrategy';

export class ExpenseSplitCalculator {
  calculate(
    total: Money,
    participants: MemberId[],
    strategy: SplitStrategy
  ): SplitAllocation[] {
    return strategy.calculate(total, participants);
  }
}
