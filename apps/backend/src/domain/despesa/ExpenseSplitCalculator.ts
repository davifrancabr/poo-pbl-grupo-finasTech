import type { MembroId } from '../grupo/MembroId';
import type { Dinheiro } from '../shared/Dinheiro';
import type { SplitAllocation } from './SplitAllocation';
import type { SplitStrategy } from './SplitStrategy';

export class ExpenseSplitCalculator {
  calculate(
    total: Dinheiro,
    participants: MembroId[],
    strategy: SplitStrategy
  ): SplitAllocation[] {
    return strategy.calculate(total, participants);
  }
}
